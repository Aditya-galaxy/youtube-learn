import { describe, expect, it } from "vitest";
import { decodeDeep, decodeHtmlEntities } from "./decodeEntities";

describe("decodeHtmlEntities", () => {
  it("decodes the entities YouTube actually returns", () => {
    expect(
      decodeDeep("Python&#39;s &quot;walrus&quot; operator &amp; you")
    ).toBe(`Python's "walrus" operator & you`);
    expect(decodeDeep("Lecture 5 &ndash; Trees &amp; Graphs")).toBe(
      "Lecture 5 – Trees & Graphs"
    );
  });

  it("handles decimal and hex escapes", () => {
    expect(decodeDeep("Caf&#233; &#x1F600; time")).toBe("Café 😀 time");
  });

  it("decodes text that was escaped twice upstream", () => {
    expect(decodeDeep("&amp;#39;double escaped&amp;#39;")).toBe(
      "'double escaped'"
    );
    // One pass only unwraps one layer, which is why decodeDeep exists.
    expect(decodeHtmlEntities("&amp;#39;x&amp;#39;")).toBe("&#39;x&#39;");
  });

  it("leaves text alone when there is nothing to decode", () => {
    expect(decodeDeep("No entities here")).toBe("No entities here");
    // A bare ampersand in a real title must survive untouched.
    expect(decodeDeep("Rock & Roll (raw ampersand)")).toBe(
      "Rock & Roll (raw ampersand)"
    );
    expect(decodeDeep("&unknownentity; stays")).toBe("&unknownentity; stays");
  });
});
