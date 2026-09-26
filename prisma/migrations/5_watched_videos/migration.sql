-- Separate "shown in the feed" from "actually watched".
-- viewed_videos records every video the feed serves, for de-duplication; only
-- rows with watchedAt set were really watched.
ALTER TABLE "viewed_videos" ADD COLUMN "watchedAt" TIMESTAMP(3);
