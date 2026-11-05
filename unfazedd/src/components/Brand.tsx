import { cx } from "./ui";

/** The line-art head that sits across the hero collage and inside the logo. */
export function HeadGlyph({
  className,
  strokeWidth = 7,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M186 348C186 300 186 264 186 242C186 158 226 108 292 108C348 108 386 152 386 208C386 244 370 268 348 282C356 298 368 312 382 320C391 325 388 338 378 340C350 344 324 334 306 318C290 326 276 330 262 330C248 330 236 334 228 344C220 354 206 350 202 338C198 328 192 330 186 328Z" />
      <path d="M292 216a34 34 0 1 1-34 34" />
      <path d="M258 250a20 20 0 1 0 20-20" />
    </svg>
  );
}

export function Logo({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "white";
  className?: string;
}) {
  return (
    <span className={cx("flex items-center gap-2.5", className)}>
      <span
        className={cx(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          tone === "white"
            ? "bg-white/10 text-white ring-1 ring-inset ring-white/35"
            : "bg-[#12a05e] text-white shadow-[0_8px_20px_-10px_rgba(18,160,94,0.9)]",
        )}
      >
        <HeadGlyph className="h-[70%] w-[70%]" strokeWidth={16} />
      </span>
      <span
        className={cx(
          "font-serif text-[22px] leading-none tracking-[-0.02em]",
          tone === "white" ? "text-white" : "text-ink",
        )}
      >
        Unfazed
      </span>
    </span>
  );
}

/** The blurred green room behind the marketing canvas. */
export function SageBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#dbe8e0]"
    >
      <div className="absolute -left-[16%] top-[-24%] h-[72vh] w-[72vw] rounded-full bg-[#c3dccb] blur-[120px]" />
      <div className="absolute right-[-18%] top-[-4%] h-[68vh] w-[58vw] rounded-full bg-[#a5c9b6] blur-[130px]" />
      <div className="absolute bottom-[-28%] left-[18%] h-[70vh] w-[66vw] rounded-full bg-[#84b39b] blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(15,61,46,0.12))]" />
    </div>
  );
}
