import { SKILL_LISTING_URL } from "@/lib/version";

// skills.sh has no embeddable badge, so this is drawn to sit beside the
// Product Hunt and Peerlist embeds: same card, skills.sh's own ▲ mark.
export function SkillsShBadge({ className = "" }: { className?: string }) {
  return (
    <a
      target="_blank"
      href={SKILL_LISTING_URL}
      rel="noopener noreferrer"
      aria-label="Agent Friendly Skill on skills.sh (new tab)"
      className={`inline-flex h-[54px] items-center gap-3 rounded-[10px] border border-badge-line bg-badge-card px-4 text-badge-ink no-underline shadow-sm hover:opacity-90 hover:no-underline ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1L16 15H0L8 1Z" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] opacity-60">Listed on</span>
        <span className="text-[19px] font-bold tracking-tight">skills.sh</span>
      </span>
    </a>
  );
}
