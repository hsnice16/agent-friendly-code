// Linguist spellings, which GitHub and GitLab return. Bitbucket lowercases
// its own ("c++", "java"), and a second spelling of a language is a second
// row in every per-language count until something folds them back together.
const LINGUIST_NAMES = [
  "ActionScript",
  "Ada",
  "Assembly",
  "Blade",
  "C",
  "C#",
  "C++",
  "Clojure",
  "CoffeeScript",
  "ColdFusion",
  "Common Lisp",
  "Crystal",
  "Cuda",
  "D",
  "Dart",
  "Elixir",
  "Erlang",
  "F#",
  "Fortran",
  "Go",
  "Groovy",
  "Haskell",
  "HTML",
  "Java",
  "JavaScript",
  "Julia",
  "Jupyter Notebook",
  "Kotlin",
  "LLVM",
  "Lua",
  "MATLAB",
  "Nim",
  "Objective-C",
  "OCaml",
  "Pascal",
  "Perl",
  "PHP",
  "PowerShell",
  "Prolog",
  "Python",
  "R",
  "Ruby",
  "Rust",
  "Scala",
  "Scheme",
  "Shell",
  "Smalltalk",
  "Swift",
  "Tcl",
  "TypeScript",
  "Verilog",
  "VHDL",
  "Vim Script",
  "Visual Basic .NET",
  "Zig",
];

const BY_LOWER = new Map(LINGUIST_NAMES.map((n) => [n.toLowerCase(), n]));

export function canonicalLanguage(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();

  if (!trimmed) {
    return null;
  }

  return BY_LOWER.get(trimmed.toLowerCase()) ?? trimmed;
}

// GitLab reports percentages, not a primary language. The name tiebreak keeps
// an even split from following JSON key order between rescores.
export function primaryLanguage(shares: Record<string, number> | null | undefined): string | null {
  let best: string | null = null;
  let bestShare = 0;

  for (const [name, share] of Object.entries(shares ?? {})) {
    if (typeof share !== "number" || share <= 0) {
      continue;
    }

    if (share > bestShare || (share === bestShare && best !== null && name < best)) {
      best = name;
      bestShare = share;
    }
  }

  return canonicalLanguage(best);
}
