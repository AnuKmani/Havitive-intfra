import type { Counter } from "@/lib/types";

export default function Counters({ counters }: { counters: Counter[] }) {
  return (
    <div className="counter-area-1 bg-smokes">
      <div className="container">
        <div className="counter-card-wrap space">
          {counters.map((c) => (
            <div className="counter-card" key={c.id}>
              <div className="media-body">
                <h2 className="box-number"><span className="counter-number">{c.counter}</span>+</h2>
                <p className="box-text">{c.counter_name?.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
