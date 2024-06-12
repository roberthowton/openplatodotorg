// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';
// 2. Define your collection(s)
const dialogCollection = defineCollection({
    type: "data",
    schema: z.record(z.string().regex(/\d{3}/), z.record(z.enum(['a', 'b', 'c', 'd', 'e']), z.string()))
});
// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
    'dialogs': dialogCollection,
};