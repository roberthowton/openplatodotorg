import { z, defineCollection } from "astro:content";

const dialogCollection = defineCollection({
  type: "data",
  schema: z.record(
    z.string().regex(/\d{3}/),
    z.record(z.enum(["a", "b", "c", "d", "e"]), z.string())
  ),
});

export const collections = {
  dialogs: dialogCollection,
};
