import { z, defineCollection } from "astro:content";

const dialogCollection = defineCollection({
  type: "data",
  schema: z.record(
    z.string().regex(/\d{3}/),
    z.record(z.enum(["a", "b", "c", "d", "e"]), z.string()),
  ),
});

const dialogV2Collection = defineCollection({
  type: "data",
  schema: z.record(
    z.string().regex(/\d{3}/),
    z.record(
      z.enum(["a", "b", "c", "d", "e"]),
      z.record(z.string().regex(/\d{1}/), z.string()),
    ),
  ),
});

export const collections = {
  dialogs: dialogCollection,
  dialogV2: dialogV2Collection,
};
