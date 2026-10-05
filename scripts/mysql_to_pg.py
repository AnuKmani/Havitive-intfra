"""Convert the INSERT statements of a phpMyAdmin MySQL dump into Postgres SQL.

Usage: python3 scripts/mysql_to_pg.py dump.sql > supabase/seed.sql
"""
import re
import sys

SKIP = {"users", "sessions", "migrations", "cache", "cache_locks", "jobs", "job_batches",
        "failed_jobs", "password_reset_tokens", "blogs"}
ESC = {"n": "\n", "r": "\r", "t": "\t", "0": "\0", "Z": "\x1a", "b": "\b"}


def parse_values(s, i):
    """Parse '(..),(..);' starting at s[i]; return list of rows and index after ';'."""
    rows, row, n = [], None, len(s)
    while i < n:
        c = s[i]
        if c == "(":
            row = []
            i += 1
        elif c == ")":
            rows.append(row)
            i += 1
        elif c == ";":
            return rows, i + 1
        elif c in ", \n\r\t":
            i += 1
        elif c == "'":
            i += 1
            buf = []
            while True:
                ch = s[i]
                if ch == "\\":
                    nxt = s[i + 1]
                    buf.append(ESC.get(nxt, nxt))
                    i += 2
                elif ch == "'" and s[i + 1] == "'":
                    buf.append("'")
                    i += 2
                elif ch == "'":
                    i += 1
                    break
                else:
                    buf.append(ch)
                    i += 1
            row.append("".join(buf))
        else:
            m = re.compile(r"[^,)\s]+").match(s, i)
            tok = m.group(0)
            row.append(None if tok.upper() == "NULL" else ("NUM", tok))
            i = m.end()
    raise ValueError("unterminated INSERT")


def lit(v):
    if v is None:
        return "NULL"
    if isinstance(v, tuple):
        return v[1]
    return "'" + v.replace("\0", "").replace("'", "''") + "'"


def main(path):
    s = open(path, encoding="utf8").read()
    out = ["begin;"]
    tables = []
    for m in re.finditer(r"INSERT INTO `(\w+)` \(([^)]*)\) VALUES\s*", s):
        table = m.group(1)
        if table in SKIP:
            continue
        cols = [c.strip().strip("`") for c in m.group(2).split(",")]
        rows, _ = parse_values(s, m.end())
        out.append(f"insert into public.{table} ({', '.join(cols)}) overriding system value values")
        out.append(",\n".join("(" + ", ".join(lit(v) for v in r) + ")" for r in rows) + ";")
        tables.append(table)
    for t in tables:
        out.append(f"select setval(pg_get_serial_sequence('public.{t}', 'id'), (select max(id) from public.{t}));")
    out.append("commit;")
    print("\n".join(out))


main(sys.argv[1])
