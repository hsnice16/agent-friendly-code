import { type Props, SignalListCardView } from "./SignalListCardView";

/** Only ids reach the view: each check's label and URL are the same on every page. */
export function SignalListCard({ items, ...rest }: Omit<Props, "ids"> & { items: { id: string }[] }) {
  return <SignalListCardView ids={items.map((s) => s.id)} {...rest} />;
}
