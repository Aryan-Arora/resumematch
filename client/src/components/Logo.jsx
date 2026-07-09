export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="ResumeMatch"
    >
      <rect width="100" height="100" rx="12" fill="#050505" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.3" />
      <line x1="50" y1="20" x2="50" y2="35" stroke="#60A5FA" strokeWidth="1.5" />
      <line x1="50" y1="65" x2="50" y2="80" stroke="#60A5FA" strokeWidth="1.5" />
      <path
        d="M20 50 H40 L45 35 L55 65 L60 50 H80"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
