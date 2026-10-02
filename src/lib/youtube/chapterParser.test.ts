import { describe, expect, it } from "vitest";
import {
  parseChaptersFromDescription,
  timestampToSeconds,
} from "./chapterParser";

describe("timestampToSeconds", () => {
  it("reads both MM:SS and HH:MM:SS", () => {
    expect(timestampToSeconds("1:45")).toBe(105);
    expect(timestampToSeconds("2:06:30")).toBe(7590);
    expect(timestampToSeconds("nonsense")).toBe(0);
  });
});

describe("parseChaptersFromDescription", () => {
  it("parses a plain chapter list and derives each chapter's end", () => {
    const chapters = parseChaptersFromDescription(
      ["0:00 Intro", "3:30 Pointers", "10:00 Wrap up"].join("\n"),
      900
    );
    expect(chapters.map((c) => c.startSeconds)).toEqual([0, 210, 600]);
    expect(chapters[0].endSeconds).toBe(210);
    // The last chapter runs to the end of the video.
    expect(chapters[2].endSeconds).toBe(900);
  });

  it("parses the emoji-and-parenthesis style freeCodeCamp uses", () => {
    const chapters = parseChaptersFromDescription(
      ["⌨️ (0:00:00) Introduction", "⌨️ (1:45:20) Installing Python"].join(
        "\n"
      ),
      7200
    );
    expect(chapters.map((c) => c.startSeconds)).toEqual([0, 6320]);
    expect(chapters[1].title).toBe("Installing Python");
  });

  it("sorts out-of-order markers and drops duplicate timestamps", () => {
    const chapters = parseChaptersFromDescription(
      ["5:00 Later", "1:00 Earlier", "1:00 Duplicate"].join("\n"),
      600
    );
    expect(chapters.map((c) => c.startSeconds)).toEqual([60, 300]);
  });

  it("returns nothing for a description without markers", () => {
    expect(
      parseChaptersFromDescription("Subscribe for more lectures!", 600)
    ).toEqual([]);
  });
});
