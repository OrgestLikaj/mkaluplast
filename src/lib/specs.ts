// Turns free-text spec lines (as editors write them in the CMS) into structure:
//   "Glazing: up to 48 mm"        → row   { label: "Glazing", value: "48 mm", prefix: "up to" }
//   "Up to Uw = 0.74 W/(m²K)"     → row   { label: "Uw", value: "0.74 W/(m²K)", prefix: "up to" }
//   "Valore Ud fino a 0,71 W/..." → row   { label: "Ud", value: "0,71 W/...", prefix: "fino a" }
//   "Xhamatura: deri në 48 mm"     → row   { label: "Xhamatura", value: "48 mm", prefix: "deri në" }
//   "5-chamber profile"           → feature
// The most telling numeric rows become highlight tiles.

export type SpecRow = { label: string; value: string; prefix?: string };
export type ParsedSpecs = { highlights: SpecRow[]; rows: SpecRow[]; features: string[] };

const UP_TO = /^(up to|fino a|deri n[eë])\s+/i;

// Higher in this list = more useful as a headline figure.
const PRIORITY = [
  /^U[wdf]$/i,
  /sound|acoust|acustic|akustik/i,
  /burglar|antieffrazione|security|sicurezza|thyerj|siguri/i,
  /glazing|vetratura|vetro|xham/i,
  /visible width|larghezza visibile|gjerësi/i,
  /depth|profondit|thellësi/i,
  /height|altezza|lartësi/i,
];

function splitPrefix(value: string): Pick<SpecRow, 'value' | 'prefix'> {
  const m = value.match(UP_TO);
  return m ? { prefix: m[1].toLowerCase(), value: value.slice(m[0].length) } : { value };
}

export function parseSpec(line: string): SpecRow | null {
  const text = line.trim();
  // Thermal transmittance written as "Up to Uw = …" / "Valore Ud fino a …"
  const u = text.match(/\b(U[wdf])\b\s*(?:=\s*|(?=fino a|up to|deri n[eë]))(.+)$/i);
  if (u) {
    const before = text.slice(0, u.index).trim();
    const prefix = UP_TO.test(before + ' ') ? before.toLowerCase() : undefined;
    const rest = splitPrefix(u[2].trim());
    return { label: u[1], value: rest.value, prefix: rest.prefix ?? prefix };
  }
  const pair = text.match(/^([^:]{2,60}):\s*(.+)$/);
  if (pair) return { label: pair[1].trim(), ...splitPrefix(pair[2].trim()) };
  // "Installation height up to 2.80 m" / "Altezza di installazione fino a 2,80 m"
  const upTo = text.match(/^(.{3,60}?)\s+(up to|fino a|deri n[eë])\s+(\d.*)$/i);
  if (upTo) return { label: upTo[1].trim(), prefix: upTo[2].toLowerCase(), value: upTo[3].trim() };
  return null;
}

export function parseSpecs(lines: string[] = [], maxHighlights = 3): ParsedSpecs {
  const rows: SpecRow[] = [];
  const features: string[] = [];
  for (const line of lines) {
    const row = parseSpec(line);
    if (row) rows.push(row);
    else if (line.trim()) features.push(line.trim());
  }

  const rank = (r: SpecRow) => {
    const i = PRIORITY.findIndex((re) => re.test(r.label));
    return i === -1 ? PRIORITY.length : i;
  };
  const highlights = rows
    .filter((r) => /\d/.test(r.value))
    .map((r, i) => ({ r, i }))
    .sort((a, b) => rank(a.r) - rank(b.r) || a.i - b.i)
    .slice(0, maxHighlights)
    .map(({ r }) => r);

  return {
    highlights,
    rows: rows.filter((r) => !highlights.includes(r)),
    features,
  };
}
