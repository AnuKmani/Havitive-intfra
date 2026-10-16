// No look-alike characters (0/O, 1/l/I), so a password is easy to read out or type.
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** A random 14-character password, made in the browser. */
export function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (n) => CHARS[n % CHARS.length]).join("");
}
