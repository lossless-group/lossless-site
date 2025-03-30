import { type CollectionEntry, getCollection, getEntry, getEntries } from "astro:content";

// utils
import { removeLocaleFromSlug, filterCollectionByLanguage } from "@utils/localeUtils";
import { slugify } from "@utils/textUtils";

// data
import { locales, defaultLocale } from "@config/siteSettings.json";

// interfaces
interface PromptData {
  title: string;
  description: string;
  date_first_published: string;
  date_last_modified?: string;
  draft?: boolean;
  tags: string[];
  authors: string[];
  slug?: string;
}

type PromptEntry = CollectionEntry<"prompts"> & {
  data: PromptData;
};

// --------------------------------------------------------
/**
 * * get all prompts in a formatted array
 * @param lang: string (optional) - language to filter by (matching a locale in i18nUtils.ts)
 * @returns all prompts, filtered for drafts, sorted by date, future prompts removed, locale removed from slug, and filtered by language if passed
 *
 * ## Examples
 *
 * ### If not using i18n features
 * ```ts
 * const prompts = await getAllPrompts();
 * ```
 *
 * ### If using i18n features
 * ```ts
 * const prompts = await getAllPrompts("en");
 * ```
 * or
 * ```ts
 * const currentLocale = getLocaleFromUrl(Astro.url);
 * const prompts = await getAllPrompts(currentLocale);
 * ```
 */
export async function getAllPrompts(
  lang?: (typeof locales)[number],
): Promise<PromptEntry[]> {
  const prompts = await getCollection("prompts", ({ data, id }) => {
    // filter out draft prompts
    return data.draft !== true;
  }) as PromptEntry[];

  // if a language is passed, filter the prompts by that language
  let filteredPrompts: PromptEntry[];
  if (lang) {
    // console.log("filtering by language", lang);
    filteredPrompts = filterCollectionByLanguage(prompts, lang);
    // filteredPrompts = prompts;
  } else {
    // console.log("no language passed, returning all prompts");
    filteredPrompts = prompts;
  }

  // filter out future prompts and sort by date
  const formattedPrompts = formatPrompts(filteredPrompts, {
    filterOutFuturePrompts: true,
    sortByDate: true,
    limit: undefined,
    removeLocale: true,
  });

  return formattedPrompts;
}

// --------------------------------------------------------
/**
 * * returns all prompts in a formatted array
 * @param prompts: PromptEntry[] - array of prompts, unformatted
 * note: this has an optional options object, params below
 * @param filterOutFuturePrompts: boolean - if true, filters out future prompts
 * @param sortByDate: boolean - if true, sorts prompts by date
 * @param limit: number - if number is passed, limits the number of prompts returned
 * @returns formatted prompts according to passed parameters
 */
interface FormatPromptsOptions {
  filterOutFuturePrompts?: boolean;
  sortByDate?: boolean;
  limit?: number;
  removeLocale?: boolean;
}

export function formatPrompts(
  prompts: PromptEntry[],
  {
    filterOutFuturePrompts = true,
    sortByDate = true,
    limit = undefined,
    removeLocale = true,
  }: FormatPromptsOptions = {},
): PromptEntry[] {
  const filteredPrompts = prompts.reduce((acc: PromptEntry[], prompt) => {
    const { data: { date_first_published } } = prompt;

    // filterOutFuturePrompts if true
    if (filterOutFuturePrompts && new Date(date_first_published) > new Date()) return acc;

    // add prompt to acc
    acc.push(prompt);

    return acc;
  }, []);

  // sortByDate if true
  if (sortByDate) {
    filteredPrompts.sort((a, b) => {
      return (
        new Date(b.data.date_first_published).valueOf() -
        new Date(a.data.date_first_published).valueOf()
      );
    });
  }

  // removeLocale from slug if true
  if (removeLocale) {
    filteredPrompts.forEach((prompt) => {
      prompt.id = removeLocaleFromSlug(prompt.id);
    });
  }

  // limit if number is passed
  if (limit) return filteredPrompts.slice(0, limit);

  return filteredPrompts;
}

// --------------------------------------------------------
/**
 * * returns true if the prompts are related to each other
 * @param promptOne: PromptEntry
 * @param promptTwo: PromptEntry
 * @returns true if the prompts are related, false if not
 *
 * note: this currently compares by categories
 *
 * In a production site, you might want to implement a more robust algorithm, choosing related prompts based on tags, categories, dates, authors, or keywords.
 * See example: https://blog.codybrunner.com/2024/adding-related-articles-with-astro-content-collections/
 */
export function arePromptsRelated(
  promptOne: PromptEntry,
  promptTwo: PromptEntry,
): boolean {
  // get categories from both prompts
  const categoriesOne = promptOne.data.tags || [];
  const categoriesTwo = promptTwo.data.tags || [];

  // check if any categories match
  return categoriesOne.some((category) => categoriesTwo.includes(category));
}

// --------------------------------------------------------
/**
 * * returns an array of processed items, sorted by count
 * @param items: string[] - array of items to count and sort
 * @returns object with counts
 *
 * note: this is used for tag and category cloud ordering
 */
export function countItems(items: string[]): object {
  return items.reduce((acc: { [key: string]: number }, item: string) => {
    // if item exists, increment count
    // if not, initialize count
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

// --------------------------------------------------------
/**
 * * returns array of arrays, sorted by value (high value first)
 * @param jsObj: object - array of "key: value" pairs to sort
 * @returns array of arrays with counts, sorted by count
 *
 * note: return looks like [ [ 'productivity', 2 ], [ 'cool-code', 1 ] ]
 * note: this is used for tag and category cloud ordering
 */
export function sortByValue(jsObj: object): any[] {
  const valArray = Object.entries(jsObj);

  // sort by value
  valArray.sort((a: any[], b: any[]): number => {
    return b[1] - a[1];
  });

  return valArray;
}
