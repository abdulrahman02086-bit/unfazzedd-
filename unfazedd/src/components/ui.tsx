import { useEffect } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useStore } from "../lib/store";

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const PATHS: Record<string, ReactNode> = {
  cross: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  shield: (
    <>
      <path d="M12 3.5 5 6v6c0 4 3 7.2 7 8.5 4-1.3 7-4.5 7-8.5V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  bolt: <path d="M13 3 5.5 13.5H11l-1 7.5 8-11H12z" />,
  arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="3" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19.8c0-2.2-.8-3.8-2-4.7" />
    </>
  ),
  note: (
    <>
      <path d="M5 4.5h9L19 9.5v10H5z" />
      <path d="M14 4.5v5h5M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
};

export function Icon({
  name,
  className,
  strokeWidth = 1.6,
}: {
  name: keyof typeof PATHS | string;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx("h-4 w-4", className)}
    >
      {PATHS[name] ?? PATHS.check}
    </svg>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost" | "quiet" | "ink";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "outline", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
        size === "sm" && "h-8 px-3.5 text-[12px]",
        size === "md" && "h-10 px-5 text-[13px]",
        size === "lg" && "h-12 px-6 text-[14px]",
        variant === "solid" && "bg-pine text-white shadow-glow hover:bg-[#188a55] active:translate-y-px",
        variant === "ink" && "bg-ink text-white hover:bg-ink-2",
        variant === "outline" &&
          "border border-rule-strong bg-paper text-ink hover:border-ink/25 hover:bg-paper-2",
        variant === "ghost" && "text-ink-2 hover:bg-mint hover:text-ink",
        variant === "quiet" && "bg-mint text-pine hover:bg-mint-2",
        className,
      )}
    />
  );
}

export function Panel({
  label,
  title,
  action,
  children,
  className,
  tone = "default",
}: {
  label?: string;
  title?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "plain" | "mint";
}) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-2xl border",
        tone === "mint" ? "border-mint-2 bg-mint" : "border-rule bg-paper shadow-soft",
        tone === "plain" && "border-0 bg-transparent shadow-none",
        className,
      )}
    >
      {(label || title || action) && (
        <header
          className={cx(
            "flex items-baseline justify-between gap-4 px-5 py-4",
            tone !== "plain" && "border-b border-rule/80",
          )}
        >
          <div className="min-w-0">
            {label && <p className="label text-ink-3">{label}</p>}
            {title && <h2 className="mt-0.5 truncate text-[15px] font-bold text-ink">{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "pine" | "warn" | "signal" | "ink" | "white";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone === "neutral" && "bg-paper-2 text-ink-2",
        tone === "pine" && "bg-pine-soft text-pine",
        tone === "warn" && "bg-ochre-soft text-ochre",
        tone === "signal" && "bg-signal-soft text-signal",
        tone === "ink" && "bg-ink text-white",
        tone === "white" && "bg-paper text-ink shadow-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="label block text-ink-3">{label}</span>
      {hint && <span className="mt-1 block text-[11.5px] font-medium leading-snug text-ink-3">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const control =
  "w-full rounded-xl border border-rule-strong bg-paper px-3 py-2.5 text-[13px] font-medium text-ink transition-shadow placeholder:font-normal placeholder:text-ink-3/70 focus:border-pine focus:outline-none focus:ring-4 focus:ring-pine/10 disabled:bg-paper-2 disabled:text-ink-3";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(control, className)} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cx(control, "appearance-none pr-8", className)}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(control, "min-h-24 resize-y leading-relaxed", className)} />;
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "signal";
}) {
  return (
    <div className="rounded-2xl border border-rule bg-paper px-4 py-3 shadow-soft">
      <p className="label text-ink-3">{label}</p>
      <p className={cx("num mt-1.5 text-[24px] leading-none", tone === "signal" ? "text-signal" : "text-ink")}>
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[11.5px] leading-snug text-ink-3">{hint}</p>}
    </div>
  );
}

export function Note({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" }) {
  return (
    <p
      className={cx(
        "rounded-xl px-3 py-2 text-[12px] leading-relaxed",
        tone === "warn" ? "bg-signal-soft text-signal" : "bg-paper-2 text-ink-2",
      )}
    >
      {children}
    </p>
  );
}

export function Locked({ children, reason }: { children?: ReactNode; reason: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-rule-strong bg-paper-2/70 px-4 py-4">
      <div className="flex items-center gap-2 text-ink-3">
        <Icon name="lock" className="h-3.5 w-3.5" />
        <span className="label">Locked</span>
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink-2">{reason}</p>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx("rise w-full overflow-hidden rounded-t-3xl bg-paper shadow-lift sm:rounded-3xl", width)}
      >
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h3 className="text-[13px] font-bold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-semibold text-ink-3 hover:text-ink"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts, dismiss } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "rise pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lift",
            t.tone === "warn" ? "bg-signal text-white" : "bg-ink text-white",
          )}
        >
          <Icon name={t.tone === "warn" ? "bolt" : "check"} className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
          <p className="flex-1 text-[12.5px] font-medium leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-[11px] opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
