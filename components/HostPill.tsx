import { hostLabel } from "@/lib/utils/format";

export function HostPill({ host }: { host: string }) {
  return <span className="chip eyebrow ml-2 border-line bg-surface-2 align-middle text-muted">{hostLabel(host)}</span>;
}
