"use client";
import React from "react";
import Hero from "./Hero/Hero";

/**
 * Ranked by view count server-side. This used to filter the local sample list
 * with `video.views > "100K"` — a lexicographic string comparison that, for
 * example, rated "1.5M" as less popular than "100K".
 */
const Trending = () => <Hero title="Trending" order="viewCount" />;

export default Trending;
