const PALETTE = ["#4648d4", "#0c9488", "#b45309", "#be185d", "#4338ca", "#0369a1"];

function initialsFrom(name) {
  const base = name.replace(/\.(pdf|docx)$/i, "").replace(/[_-]+/g, " ").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export default function Avatar({ name, size = 40 }) {
  const initials = initialsFrom(name);
  const bg = colorFor(name);
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-heading font-semibold flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
