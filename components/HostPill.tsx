import { hostLabel } from "@/lib/utils/format";

export function HostPill({ host }: { host: string }) {
  return <span className="chip eyebrow host-pill">{hostLabel(host)}</span>;
}
