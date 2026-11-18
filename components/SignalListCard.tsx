import { checkPath } from "@/lib/utils/check-path";

import { type Props, SignalListCardView } from "./SignalListCardView";

type Item = { id: string; label: string };

/** Check hrefs are resolved here: `checkPath` reads the signal registry, which can't ship to the client. */
export function SignalListCard({ items, ...rest }: Omit<Props, "items"> & { items: Item[] }) {
  return (
    <SignalListCardView items={items.map((s) => ({ id: s.id, label: s.label, href: checkPath(s.id) }))} {...rest} />
  );
}
