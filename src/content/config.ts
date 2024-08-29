import { z, defineCollection } from "astro:content";

const dialogCollection = defineCollection({
  type: "data",
  schema: z.record(
    z.string().regex(/\d+/),
    z.record(z.enum(["a", "b", "c", "d", "e"]), z.string())
  ),
});

export const collections = {
  dialogs: dialogCollection,
};
