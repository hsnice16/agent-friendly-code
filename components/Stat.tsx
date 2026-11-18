export function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="tile">
      <dt className="text-[12.5px] eyebrow text-muted">{label}</dt>
      <dd className="stat-value">{value}</dd>
      {note && <dd className="m-0 mt-1 text-[13px] text-muted">{note}</dd>}
    </div>
  );
}
