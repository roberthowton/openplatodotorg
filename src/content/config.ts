import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro:schema";

// const dialogCollection = defineCollection({
//   type: "data",
//   schema: z.record(
//     z.string().regex(/\d+/),
//     z.record(z.enum(["a", "b", "c", "d", "e"]), z.string()),
//   ),
// });

const dialogue = defineCollection({
  loader: glob({ pattern: "**/*.xml", base: "./src/content/dialogue" }),
});

const comment = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/comment" }),
  schema: z.object({
    id: z.string(),
    type: z.literal("commentary"),
    firstRead: z.boolean().default(false),
    targets: z.array(
      z.object({
        stephanus: z.string().optional(),
        stephanusRange: z
          .object({
            start: z.string(),
            end: z.string(),
          })
          .optional(),
        match: z.string().optional(),
      })
    ),
  }),
});

export const collections = {
  dialogue,
  comment,
};
