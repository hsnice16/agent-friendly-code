import { APP_VERSION, IS_PRE_RELEASE } from "@/lib/version";

export function VersionPill() {
  return (
    <span
      role="img"
      aria-label={IS_PRE_RELEASE ? `Version ${APP_VERSION}, pre-release` : `Version ${APP_VERSION}`}
      title={IS_PRE_RELEASE ? "Not yet released — pre-release build" : undefined}
      className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[12.5px] tracking-wide tabular-nums text-muted"
    >
      v{APP_VERSION}
      {IS_PRE_RELEASE && <span className="ml-1.5 text-warn">· pre-release</span>}
    </span>
  );
}
