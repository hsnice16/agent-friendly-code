import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";

// Not in leaderboard-href.ts, which the browser board imports: MODEL_BY_ID
// would ship every agent's weights to the client.
// `in` would also accept `constructor` and the rest of Object.prototype.
export function isModelId(value: string | null | undefined): value is ModelId {
  return value != null && Object.hasOwn(MODEL_BY_ID, value);
}
