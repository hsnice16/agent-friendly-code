import { CheckCircle } from "@phosphor-icons/react";

export function BadgeAdoptedTag() {
  return (
    <span
      title="This repo shows its Agent Friendly Code badge in its README"
      className="chip eyebrow ml-2 border-ok/40 bg-ok/10 text-ok"
    >
      <CheckCircle size={12} weight="fill" aria-hidden="true" />
      Badge
    </span>
  );
}
