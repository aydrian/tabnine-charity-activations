import { cn } from "~/utils/misc.ts";

export default function CompanyLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-[170px]", className)}
      viewBox="0 0 301.5 57.05"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          gradientTransform="matrix(1 0 0 -1 0 677.93)"
          gradientUnits="userSpaceOnUse"
          id="a"
          x1={50.13}
          x2={-1.41}
          y1={626.7}
          y2={673.78}
        >
          <stop offset={0} stopColor="#4ba1fc" />
          <stop offset={1} stopColor="#ec2aed" />
        </linearGradient>
      </defs>
      <path
        d="M49.05 28.53 13.39 48.79m35.66-20.26L13.26 8.33m35.79 20.2V15.01L25.28 1.5 13.26 8.33m35.79 20.2v13.51L25.27 55.55l-11.89-6.76m0 0-.13-40.46m.13 40.46L1.5 42.04V15.01l11.76-6.68"
        style={{
          fill: "none",
          stroke: "url(#a)",
          strokeLinejoin: "round",
          strokeWidth: 3
        }}
      />
      <path
        d="M89.54 48.64c7.15 0 12.05-4.08 12.05-12.23v-.69h-4.08v.69c0 5.71-3.2 8.34-7.97 8.34s-7.97-2.7-7.97-8.34V20.66h18.26v-3.83H81.57V5.86h-4.2v30.55c0 8.16 4.96 12.23 12.17 12.23Zm32.11 0c6.02 0 11.17-2.95 13.36-8.47v7.65h3.89V32.51c0-9.79-6.84-16.5-16.62-16.5s-16.69 6.84-16.69 16.5 7.34 16.12 16.06 16.12Zm.63-3.89c-7.4 0-12.42-5.27-12.42-12.42s5.02-12.42 12.42-12.42 12.42 5.27 12.42 12.42-5.02 12.42-12.42 12.42Zm39.35 3.89c9.85 0 16.75-6.9 16.75-16.44s-6.96-16.19-16.06-16.19c-5.9 0-10.73 2.76-13.05 7.47V3.29h-4.2v28.86c0 9.98 6.96 16.5 16.56 16.5Zm.06-3.89c-7.47 0-12.42-5.27-12.42-12.42s4.96-12.42 12.42-12.42 12.42 5.27 12.42 12.42-5.02 12.42-12.42 12.42Zm21.61 3.08h4.2V31.64c0-7.65 4.39-11.73 11.1-11.73s11.1 4.08 11.1 11.73v16.19h4.2V31.64c0-10.29-6.15-15.62-15.31-15.62s-15.31 5.33-15.31 15.62v16.19Zm40.02-37.02c1.82 0 3.2-1.38 3.2-3.2s-1.38-3.2-3.2-3.2-3.2 1.38-3.2 3.2 1.38 3.2 3.2 3.2Zm-2.07 37.01h4.2V16.84h-4.2v30.99Zm11.49.01h4.2V31.64c0-7.65 4.39-11.73 11.1-11.73s11.1 4.08 11.1 11.73v16.19h4.2V31.64c0-10.29-6.15-15.62-15.31-15.62s-15.31 5.33-15.31 15.62v16.19Zm52.2.81c7.21 0 12.86-3.76 15.24-9.47h-4.58c-2.01 3.58-5.77 5.58-10.67 5.58-6.96 0-11.79-4.58-12.36-11.04h28.92v-1.38c0-9.41-6.78-16.31-16.56-16.31s-16.69 6.9-16.69 16.31 6.9 16.31 16.69 16.31Zm-12.23-18.7c.94-6.09 5.77-10.04 12.23-10.04s11.17 3.76 12.17 10.04h-24.4Z"
        style={{
          fill: "#100f11"
        }}
      />
    </svg>
  );
}
