import type { ReactNode } from "react";

import { APP_NAME, APP_URL } from "@/lib/version";

import { CopySnippet } from "./CopySnippet";
import { Panel, PanelHeading } from "./Panel";

/** The citation a report asks for; `asOf` is the data's date, since the numbers move with every rescore. */
export function CiteThis({
  title,
  path,
  asOf,
  children,
}: {
  title: string;
  path: string;
  asOf: string;
  children?: ReactNode;
}) {
  return (
    <Panel>
      <PanelHeading>Cite this</PanelHeading>
      <CopySnippet text={`${APP_NAME}. "${title}." Data as of ${asOf}. ${APP_URL}${path}`} />
      {children}
    </Panel>
  );
}
