/**
 * Decodes the HTML entities the YouTube API returns inside text fields.
 *
 * `snippet.title` and friends arrive HTML-escaped, so a lecture called
 * `Python's "walrus" operator & you` comes back as
 * `Python&#39;s &quot;walrus&quot; operator &amp; you`. React escapes on
 * render, so writing that straight into the page shows the entities to the
 * learner. Decoding belongs at ingestion: once a title is stored escaped, every
 * later consumer — the classroom, the tutor's prompt, a generated course —
 * carries the damage.
 */
const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function decodeHtmlEntities(text: string): string {
  if (!text || !text.includes("&")) return text;

  return text.replace(
    /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));/g,
    (match, dec: string, hex: string, name: string) => {
      if (dec) {
        const code = Number(dec);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }
      if (hex) {
        const code = Number.parseInt(hex, 16);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }
      // `&amp;amp;` shows up when a title was escaped twice upstream, so the
      // result is decoded again rather than left as "&amp;".
      const value = NAMED[name.toLowerCase()];
      return value === undefined ? match : value;
    }
  );
}

/** Decodes repeatedly escaped text, e.g. `&amp;#39;` → `'`. */
export function decodeDeep(text: string, rounds = 3): string {
  let out = text;
  for (let i = 0; i < rounds; i += 1) {
    const next = decodeHtmlEntities(out);
    if (next === out) break;
    out = next;
  }
  return out;
}
