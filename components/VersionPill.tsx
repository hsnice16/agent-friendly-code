import { APP_VERSION, IS_PRE_RELEASE } from "@/lib/version";

export function VersionPill() {
  return (
    <span
      role="img"
      aria-label={IS_PRE_RELEASE ? `Version ${APP_VERSION}, pre-release` : `Version ${APP_VERSION}`}
      title={IS_PRE_RELEASE ? "Not yet released — pre-release build" : undefined}
      className="chip border-line bg-surface-2 tabular-nums text-muted"
    >
      v{APP_VERSION}
      {IS_PRE_RELEASE && <span className="text-warn">· pre-release</span>}
    </span>
  );
}
