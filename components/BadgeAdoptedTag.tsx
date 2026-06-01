import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

export function BadgeAdoptedTag() {
  return (
    <span
      title="This repo embeds its Agent Friendly Code badge in its README"
      className="ml-2 inline-flex items-center gap-1 rounded border border-ok/40 bg-ok/10 px-2 py-px align-middle text-[10.5px] font-semibold uppercase tracking-wider text-ok"
    >
      <CheckCircle size={12} weight="fill" aria-hidden="true" />
      Badge
    </span>
  );
}
