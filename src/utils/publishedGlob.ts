import { glob } from 'astro/loaders';

/**
 * glob() that drops entries marked `publish: false`.
 *
 * Filtering here rather than in each route means an unpublished entry disappears
 * from every page, list, tag count and the sitemap, and a new route can't forget
 * the check. A missing `publish` key still counts as published.
 *
 * Entries are filtered as they're written as well as after loading: two files can
 * share a slug, and an unpublished one must not overwrite its published twin.
 *
 * In `astro dev`, an entry changed to `publish: false` stays until the next restart.
 */
export function publishedGlob(options: Parameters<typeof glob>[0]): ReturnType<typeof glob> {
  const loader = glob(options);
  return {
    ...loader,
    load: async (context) => {
      const { store } = context;
      const isUnpublished = (data: unknown) => (data as { publish?: unknown })?.publish === false;
      await loader.load({
        ...context,
        store: { ...store, set: (entry) => (isUnpublished(entry.data) ? false : store.set(entry)) },
      });
      for (const [id, entry] of store.entries()) {
        if (isUnpublished(entry.data)) store.delete(id);
      }
    },
  };
}
