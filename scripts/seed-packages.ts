import type { Registry } from "../lib/clients/registries";
import { lookupPackage } from "../lib/package-lookup";

const PACKAGES: Array<{ registry: Registry; name: string }> = [
  { registry: "npm", name: "next" },
  { registry: "npm", name: "axios" },
  { registry: "npm", name: "react" },
  { registry: "npm", name: "eslint" },
  { registry: "npm", name: "prettier" },
  { registry: "pypi", name: "fastapi" },
  { registry: "pypi", name: "requests" },
  { registry: "cargo", name: "axum" },
  { registry: "cargo", name: "serde" },
  { registry: "cargo", name: "tokio" },
  { registry: "cargo", name: "ripgrep" },
];

export async function seedPackages() {
  console.log(`\n━━━ seeding ${PACKAGES.length} popular packages for /package chips ━━━`);

  let other = 0;
  let scored = 0;

  for (const { registry, name } of PACKAGES) {
    try {
      const result = await lookupPackage(registry, name);
      console.log(`  ${registry}/${name} → ${result.status}`);

      if (result.status === "scored") {
        scored++;
      } else {
        other++;
      }
    } catch (e) {
      console.error(`  ${registry}/${name} → error: ${(e as Error).message}`);
      other++;
    }
  }

  console.log(`package seed done — ${scored} scored / ${other} other`);
}

// Run when invoked as a top-level script (e.g. `bun run seed-packages`),
// but stay inert when imported by scripts/seed.ts so we don't double-execute.
if (process.argv[1]?.endsWith("seed-packages.ts")) {
  void seedPackages();
}
