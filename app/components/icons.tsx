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

export const IconStethoscope = (p: P) => (
  <svg {...base} {...p}><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M10 12v3a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></svg>
);
export const IconStore = (p: P) => (
  <svg {...base} {...p}><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5 12v8h14v-8M10 20v-5h4v5" /></svg>
);
export const IconWrench = (p: P) => (
  <svg {...base} {...p}><path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L13 3l2 2-1 2 2 1 2-1" /><path d="M3 21l6-6" /></svg>
);
export const IconScissors = (p: P) => (
  <svg {...base} {...p}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" /></svg>
);
export const IconCoffee = (p: P) => (
  <svg {...base} {...p}><path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 2v3M12 2v3" /></svg>
);
export const IconFileUp = (p: P) => (
  <svg {...base} {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M12 18v-6M9 15l3-3 3 3" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg {...base} {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" /></svg>
);
export const IconListChecks = (p: P) => (
  <svg {...base} {...p}><path d="M3 6l1.5 1.5L7 5M3 13l1.5 1.5L7 12M3 20l1.5 1.5L7 19" /><path d="M11 6h10M11 13h10M11 20h10" /></svg>
);
export const IconGrid = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /></svg>
);
export const IconChats = (p: P) => (
  <svg {...base} {...p}><path d="M14 9a2 2 0 0 1-2 2H6l-3 3V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2z" /><path d="M18 9h1a2 2 0 0 1 2 2v9l-3-3h-5a2 2 0 0 1-2-2v-1" /></svg>
);
export const IconMenu = (p: P) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconX = (p: P) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconTable = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16" /></svg>
);
export const IconTrend = (p: P) => (
  <svg {...base} {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>
);
export const IconSettings = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></svg>
);
export const IconLogout = (p: P) => (
  <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);
export const IconArrowUp = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
);
export const IconArrowDown = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
export const IconSend = (p: P) => (
  <svg {...base} {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>
);
export const IconPrinter = (p: P) => (
  <svg {...base} {...p}><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="7" /></svg>
);
export const IconLock = (p: P) => (
  <svg {...base} {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
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
