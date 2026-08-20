import { useEffect, useRef, useState } from "react";

// Interactive "How it works" tour — imported/translated from the
// claude.ai/design mock ("Streamlined Journey.dc.html"). Auto-advances every
// 6s, pauses on hover, and lets the user jump to any step directly. Colors
// are mapped onto the app's CSS variables (not the mock's hardcoded teal) so
// it stays correct in dark mode.

const STEP_DATA = [
  {
    title: "Ingest",
    body: "Paste a job description and upload PDF or DOCX resumes.",
    headline: "Drop in the JD and the pile of resumes.",
    detail:
      "Bulk upload PDF or DOCX files and paste the job description as-is. Parsing happens locally, so nothing leaves the machine.",
    tags: ["PDF & DOCX", "Bulk upload", "Local parsing"],
  },
  {
    title: "Analyze",
    body: "Local embeddings map skills, experience, and intent signals.",
    headline: "Every resume becomes a map of signals.",
    detail:
      "Local embeddings turn free-form experience into structured skills, seniority, and intent — including the things candidates imply rather than list.",
    tags: ["Embeddings", "Skill graph", "Intent signals"],
  },
  {
    title: "Match",
    body: "Candidates are ranked against your specific JD, including skills they never wrote down.",
    headline: "Ranked against your JD, not a generic template.",
    detail:
      "Scores are computed per requirement, so you can see which lines of the JD each candidate actually satisfies — and where the gaps are.",
    tags: ["Per-requirement scoring", "Explainable", "Gap view"],
  },
  {
    title: "Hire",
    body: "Shortlist and notify candidates for the physical round, right from the table.",
    headline: "Shortlist and notify, right from the table.",
    detail:
      "Select the top candidates, send interview invites for the physical round, and keep the whole panel in one view.",
    tags: ["One-click shortlist", "Invites", "Panel view"],
  },
];

const ICON_PATHS = [
  "M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9zM13 3v6h6M12 18v-6M9.5 14.5 12 12l2.5 2.5",
  "M12 4a4 4 0 0 0-4 4 3 3 0 0 0-1 5.8V16a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-2.2A3 3 0 0 0 16 8a4 4 0 0 0-4-4ZM12 4v15M9 11h6",
  "M9.5 6a6 6 0 1 0 0 12 6 6 0 1 0 5-12 6 6 0 0 1 0 12M14.5 6a6 6 0 1 0 0 12",
  "M4 20l6-2M4 20l2-6M10 18l8-8M6 14l8-8M14 4l1 3M20 10l-3-1M17.5 5.5 20 4M19 13l2 2",
];

function StepIcon({ i, color }) {
  return (
    <svg
      width={30}
      height={30}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICON_PATHS[i]} />
    </svg>
  );
}

function Line({ w, o }) {
  return (
    <div
      style={{
        height: 8,
        width: w,
        borderRadius: 99,
        background: "var(--color-border)",
        opacity: o,
      }}
    />
  );
}

function StepVisual({ i }) {
  const teal = "var(--color-accent)";
  const soft = "color-mix(in srgb, var(--color-accent) 15%, transparent)";
  const boxStyle = {
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: 16,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  if (i === 0) {
    return (
      <div style={boxStyle}>
        <div
          style={{
            border: "1.5px dashed color-mix(in srgb, var(--color-accent) 35%, transparent)",
            borderRadius: 12,
            padding: "22px 16px",
            textAlign: "center",
            background: "color-mix(in srgb, var(--color-accent) 4%, transparent)",
            animation: "jFloat 3.4s ease-in-out infinite",
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, color: teal }}>Drop resumes here</div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-faint)", marginTop: 4 }}>
            PDF · DOCX · up to 500 files
          </div>
        </div>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 30,
                borderRadius: 4,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            />
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 99,
                background: "var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${100 - k * 18}%`,
                  background: teal,
                  opacity: 0.8,
                  transformOrigin: "left",
                  animation: `jBar ${1 + k * 0.35}s cubic-bezier(.22,1,.36,1) both`,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--color-text-faint)",
                width: 34,
                textAlign: "right",
              }}
            >
              {["done", "done", "82%"][k]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (i === 1) {
    const pts = [
      [30, 70],
      [80, 38],
      [132, 84],
      [186, 52],
      [232, 26],
    ];
    return (
      <div style={boxStyle}>
        <svg viewBox="0 0 262 110" style={{ width: "100%", height: 130 }}>
          <path
            d="M30 70 80 38 132 84 186 52 232 26"
            stroke={soft}
            strokeWidth={20}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M30 70 80 38 132 84 186 52 232 26"
            stroke={teal}
            strokeWidth={2}
            fill="none"
            strokeDasharray="8 8"
            style={{ animation: "jDash 6s linear infinite" }}
          />
          {pts.map((p, k) => (
            <circle
              key={k}
              cx={p[0]}
              cy={p[1]}
              r={6}
              fill="var(--color-surface)"
              stroke={teal}
              strokeWidth={2}
              style={{ animation: `jFloat ${2.6 + k * 0.3}s ease-in-out infinite` }}
            />
          ))}
        </svg>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Python", "Distributed systems", "Mentoring", "Ownership"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 99,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (i === 2) {
    const rows = [
      ["A. Okafor", 94],
      ["M. Chen", 88],
      ["R. Patel", 81],
      ["S. Alvarez", 74],
    ];
    return (
      <div style={boxStyle}>
        {rows.map((r, k) => (
          <div key={r[0]} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 99,
                background: k === 0 ? teal : "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: k === 0 ? "var(--color-accent-contrast)" : "var(--color-text-faint)",
                fontSize: 11.5,
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
              }}
            >
              {k + 1}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", width: 86 }}>
              {r[0]}
            </div>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 99,
                background: "var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${r[1]}%`,
                  borderRadius: 99,
                  background:
                    k === 0
                      ? `linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, white))`
                      : "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                  transformOrigin: "left",
                  animation: `jBar ${0.7 + k * 0.18}s cubic-bezier(.22,1,.36,1) both`,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: k === 0 ? teal : "var(--color-text-faint)",
                width: 28,
                textAlign: "right",
              }}
            >
              {r[1]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
          Shortlist · 3 selected
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--color-accent-contrast)",
            background: teal,
            padding: "6px 12px",
            borderRadius: 99,
            animation: "jFloat 3s ease-in-out infinite",
          }}
        >
          Send invites
        </div>
      </div>
      {["A. Okafor", "M. Chen", "R. Patel"].map((n, k) => (
        <div
          key={n}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 10,
            padding: "10px 12px",
            animation: `jRise ${0.35 + k * 0.12}s ease both`,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: teal,
              color: "var(--color-accent-contrast)",
              fontSize: 11,
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", flex: 1 }}>
            {n}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--color-text-faint)" }}>
            Round 2 · invited
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StreamlinedJourney() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);
  const stateRef = useRef({ playing, hovered });
  stateRef.current = { playing, hovered };

  function arm() {
    clearTimeout(timerRef.current);
    if (!stateRef.current.playing || stateRef.current.hovered !== null) return;
    timerRef.current = setTimeout(() => {
      setActive((a) => (a + 1) % STEP_DATA.length);
      setTick((t) => t + 1);
      arm();
    }, 6000);
  }

  useEffect(() => {
    arm();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(i) {
    setActive(i);
    setTick((t) => t + 1);
    setPlaying(false);
    setTimeout(arm, 0);
  }

  function togglePlay() {
    setPlaying((p) => !p);
    setTick((t) => t + 1);
    setTimeout(arm, 0);
  }

  function onHover(i) {
    setHovered(i);
    clearTimeout(timerRef.current);
  }

  function onUnhover() {
    setHovered(null);
    setTimeout(arm, 0);
  }

  const d = STEP_DATA[active];
  const railScale = (active + 1) / STEP_DATA.length;
  const barOn = playing && hovered === null;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px 7px 10px",
            borderRadius: 999,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 1px 2px rgba(15,23,42,.04)",
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--color-accent)",
              boxShadow: "0 0 0 4px color-mix(in srgb, var(--color-accent) 15%, transparent)",
            }}
          />
          How it works
        </div>
        <h2
          className="font-heading tracking-tight text-balance"
          style={{ margin: 0, fontSize: 44, lineHeight: 1.05, fontWeight: 800, color: "var(--color-text)" }}
        >
          A streamlined journey
        </h2>
        <p
          style={{
            margin: 0,
            maxWidth: 520,
            fontSize: 16.5,
            lineHeight: 1.6,
            color: "var(--color-text-muted)",
          }}
        >
          Four steps from a job description to a shortlist. Follow along, or click any step.
        </p>
      </div>

      <div style={{ marginTop: 56, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 46,
            height: 2,
            background: "var(--color-border)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background:
                "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, white))",
              borderRadius: 2,
              transformOrigin: "left",
              transition: "transform .7s cubic-bezier(.65,0,.35,1)",
              transform: `scaleX(${railScale})`,
            }}
          />
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ gap: 28, position: "relative" }}
        >
          {STEP_DATA.map((step, i) => {
            const on = i === active;
            const hov = i === hovered;
            const live = on || hov;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => go(i)}
                onMouseEnter={() => onHover(i)}
                onMouseLeave={onUnhover}
                style={{
                  appearance: "none",
                  border: 0,
                  background: "transparent",
                  padding: 0,
                  textAlign: "center",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 94,
                    height: 94,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      background: on
                        ? "linear-gradient(160deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, black))"
                        : hov
                          ? "color-mix(in srgb, var(--color-accent) 8%, transparent)"
                          : "var(--color-surface)",
                      border: on
                        ? "1px solid transparent"
                        : hov
                          ? "1px solid color-mix(in srgb, var(--color-accent) 28%, transparent)"
                          : "1px solid var(--color-border)",
                      boxShadow: on
                        ? "0 14px 30px -12px color-mix(in srgb, var(--color-accent) 55%, transparent)"
                        : "0 1px 2px rgba(16,24,40,.05)",
                      transition: "all .45s cubic-bezier(.34,1.4,.64,1)",
                      transform: `scale(${on ? 1.06 : hov ? 1.03 : 1})`,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      border: "2px solid color-mix(in srgb, var(--color-accent) 50%, transparent)",
                      animation: "jPulse 2.4s ease-out infinite",
                      opacity: on && playing ? 1 : 0,
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "grid",
                      placeItems: "center",
                      transition: "transform .5s cubic-bezier(.34,1.4,.64,1)",
                      transform: `scale(${live ? 1.1 : 1})`,
                    }}
                  >
                    <StepIcon i={i} color={on ? "var(--color-accent-contrast)" : "var(--color-accent)"} />
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: on ? "var(--color-accent)" : "var(--color-text-faint)",
                      background: on ? "var(--color-surface)" : "var(--color-bg)",
                      border: on
                        ? "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)"
                        : "1px solid var(--color-border)",
                      transition: "all .35s ease",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    className="font-heading"
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: "-.01em",
                      color: live ? "var(--color-text)" : "var(--color-text-muted)",
                      transition: "color .3s ease",
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      maxWidth: 230,
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      color: live ? "var(--color-text-muted)" : "var(--color-text-faint)",
                      transition: "color .3s ease",
                    }}
                  >
                    {step.body}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="clay-card"
        style={{
          marginTop: 52,
          borderRadius: 22,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 3, background: "var(--color-border)" }}>
          <div
            key={`bar-${tick}-${playing}`}
            style={{
              height: "100%",
              width: "100%",
              background:
                "linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, white))",
              transformOrigin: "left",
              animation: "jBar 6s linear forwards",
              opacity: barOn ? 1 : 0,
            }}
          />
        </div>
        <div
          key={active}
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 40, padding: "38px 40px 40px", alignItems: "center" }}
        >
          <div style={{ animation: "jRise .5s cubic-bezier(.22,1,.36,1) both" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              Step {active + 1} of {STEP_DATA.length} · {d.title}
            </div>
            <h3
              className="font-heading"
              style={{
                margin: "12px 0 0",
                fontSize: 27,
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: "-.02em",
                color: "var(--color-text)",
              }}
            >
              {d.headline}
            </h3>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 16,
                lineHeight: 1.65,
                color: "var(--color-text-muted)",
              }}
            >
              {d.detail}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
              {d.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-accent)",
                    background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div style={{ animation: "jRise .6s cubic-bezier(.22,1,.36,1) both" }}>
            <StepVisual i={active} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginTop: 26,
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          className="clay-button"
          style={{
            appearance: "none",
            fontFamily: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 16px",
            borderRadius: 999,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text-muted)",
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          {playing ? "Pause tour" : "Play tour"}
        </button>
        <div style={{ display: "flex", gap: 7 }}>
          {STEP_DATA.map((step, i) => (
            <button
              key={step.title}
              type="button"
              onClick={() => go(i)}
              aria-label={step.title}
              style={{
                appearance: "none",
                cursor: "pointer",
                border: 0,
                padding: 0,
                height: 7,
                width: i === active ? 26 : 7,
                borderRadius: 999,
                background: i === active ? "var(--color-accent)" : "var(--color-border)",
                transition: "all .4s cubic-bezier(.34,1.4,.64,1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
