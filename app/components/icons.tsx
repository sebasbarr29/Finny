import type { SVGProps } from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

type P = SVGProps<SVGSVGElement>;

export const IconReport = (p: P) => (
  <svg {...base} {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg>
);
export const IconBulb = (p: P) => (
  <svg {...base} {...p}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" /></svg>
);
export const IconChat = (p: P) => (
  <svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
);
export const IconChart = (p: P) => (
  <svg {...base} {...p}><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg>
);
export const IconTodo = (p: P) => (
  <svg {...base} {...p}><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);
export const IconUpload = (p: P) => (
  <svg {...base} {...p}><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
);
export const IconCalc = (p: P) => (
  <svg {...base} {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4" /></svg>
);
export const IconGlobe = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
);
export const IconHistory = (p: P) => (
  <svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 3" /></svg>
);
export const IconCard = (p: P) => (
  <svg {...base} {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
);
export const IconArrow = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconTrendUp = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}><path d="M7 17L17 7M9 7h8v8" /></svg>
);
export const IconAlert = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base} strokeWidth={3} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconClinic = (p: P) => (
  <svg {...base} {...p}><path d="M12 8v8M8 12h8" /><rect x="3" y="3" width="18" height="18" rx="4" /></svg>
);
export const IconShop = (p: P) => (
  <svg {...base} {...p}><path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M3 9h18M9 20v-6h6v6" /></svg>
);
export const IconBriefcase = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
export const IconShield = (p: P) => (
  <svg {...base} {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);

/** Finny mark: a friendly fish with a green-to-blue body on a soft green tile. */
export function LogoMark({ className = "logo-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="finny-fish" x1="0" y1="0.2" x2="1" y2="0.8">
          <stop offset="0" stopColor="#338063" />
          <stop offset="1" stopColor="#397FA3" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#E7F1EC" stroke="#D3E4DA" />
      <path d="M6.5 16.6c3-4.9 8.9-6.5 14-3.6l4.4-3.5v12.2l-4.4-3.5c-5.1 2.9-11 1.3-14-1.6z" fill="url(#finny-fish)" />
      <circle cx="11.4" cy="16.1" r="1.25" fill="#FFFFFF" />
      <path d="M15.6 13.3c.9 1.6.9 3.6 0 5.2" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
