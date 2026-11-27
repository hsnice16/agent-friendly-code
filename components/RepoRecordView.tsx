"use client";

import { Fragment } from "react";

import type { CensusFacts, FirstSeenFact, PolicyFact, RepoRecord } from "@/lib/repo-record";

import { InfoRow } from "./InfoRow";
import { IntentLink } from "./IntentLink";
import { Panel, PanelHeading } from "./Panel";
import { STANCE_CHIP } from "./stance-chip";

const CODE = "font-mono text-[13px] text-ink";

function When({ day }: { day: { iso: string; text: string } }) {
  return <time dateTime={day.iso}>{day.text}</time>;
}

function FirstSeen({ facts }: { facts: FirstSeenFact[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {facts.map((f) => (
        <li key={f.file}>
          <code className={CODE}>{f.file}</code>{" "}
          {!f.firstFound ? (
            <>
              already there when first checked, <When day={f.checkedFrom} />
            </>
          ) : (
            <>
              first found <When day={f.firstFound} />
              <span className="text-muted">
                {f.lastMissed ? (
                  <>
                    ; not there on <When day={f.lastMissed} />
                  </>
                ) : (
                  <>
                    ; earlier checks, from <When day={f.checkedFrom} />, ran an older version of it
                  </>
                )}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function Census({ census }: { census: CensusFacts }) {
  const more = census.nestedTotal - census.nested.length;
  return (
    <>
      {census.nested.length > 0 && (
        <p className="m-0 [overflow-wrap:anywhere]">
          {census.nestedTotal} below the root:{" "}
          {census.nested.map((p, i) => (
            <Fragment key={p.name}>
              {i > 0 && ", "}
              {p.href ? (
                <a href={p.href} target="_blank" rel="nofollow noopener noreferrer" className="ink-link">
                  <code className={CODE}>{p.name}</code>
                  <span className="sr-only"> (new tab)</span>
                </a>
              ) : (
                <code className={CODE}>{p.name}</code>
              )}
            </Fragment>
          ))}
          {more > 0 && <span className="text-muted">, and {more} more</span>}
        </p>
      )}
      {census.other.length > 0 && (
        <p className="m-0 [overflow-wrap:anywhere]">
          Also{" "}
          {census.other.map((o, i) => (
            <Fragment key={o}>
              {i > 0 && ", "}
              <code className={CODE}>{o}</code>
            </Fragment>
          ))}
        </p>
      )}
      {census.relations.length > 0 && <p className="m-0">{census.relations.join("; ")}</p>}
      <p className="m-0 text-[13px] text-muted">
        From the file census of <When day={census.date} />
        {census.truncated && ", which GitHub cut short for this repo, so there may be more"}
      </p>
    </>
  );
}

function Policy({ policy }: { policy: PolicyFact }) {
  return (
    <>
      <span className={`chip eyebrow mr-2 whitespace-nowrap ${STANCE_CHIP[policy.stance]}`}>{policy.label}</span>
      {policy.summary}{" "}
      <span className="text-muted">
        (
        <a href={policy.href} target="_blank" rel="nofollow noopener noreferrer" className="dim-link">
          {policy.path}
          <span className="sr-only"> (new tab)</span>
        </a>
        , read <When day={policy.checked} /> ·{" "}
        <IntentLink href={policy.reportHref} className="dim-link">
          other projects
        </IntentLink>
        )
      </span>
    </>
  );
}

/** Facts from the committed data files that no other repo page shares. */
export function RepoRecordView({ slug, record }: { slug: string; record: RepoRecord }) {
  return (
    <Panel>
      <PanelHeading>
        <span className="normal-case">{slug}</span> on record
      </PanelHeading>
      <dl className="m-0">
        {record.firstSeen.length > 0 && (
          <InfoRow label="On this board">
            <FirstSeen facts={record.firstSeen} />
          </InfoRow>
        )}
        {record.census && (
          <InfoRow label="More agent files">
            <Census census={record.census} />
          </InfoRow>
        )}
        {record.readers.length > 0 && (
          <InfoRow label="Which agents read them">
            <ul className="m-0 list-none p-0">
              {record.readers.map((r) => (
                <li key={r.file}>
                  <code className={CODE}>{r.file}</code>: {r.readers}
                </li>
              ))}
            </ul>
            <IntentLink href="/agents" className="dim-link text-[13px]">
              From each agent's docs
            </IntentLink>
          </InfoRow>
        )}
        {record.policy && (
          <InfoRow label="AI contribution policy">
            <Policy policy={record.policy} />
          </InfoRow>
        )}
      </dl>
    </Panel>
  );
}
