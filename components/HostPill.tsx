import { hostLabel } from "@/lib/utils/format";

export function HostPill({ host }: { host: string }) {
  return (
    <span className="ml-2 inline-block rounded border border-line bg-surface-2 px-2 py-px align-middle text-[10.5px] font-semibold uppercase tracking-wider text-muted">
      {hostLabel(host)}
    </span>
  );
}
