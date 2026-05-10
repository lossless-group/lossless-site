/**
 * /llms-full.txt — concatenated raw markdown of every published entry
 * across the org site's substantive collections.
 *
 * Spec: https://llmstxt.org/
 *
 * The human-editable prose template lives at `src/llms/llms-full.md` (with
 * token documentation in `src/llms/README.md`). This file is the dumb
 * assembler: it loads the template, gathers the corpus bodies, and
 * substitutes tokens.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { AppConfig } from '@utils/appConfig';
import { slugify, getReferenceSlug } from '@utils/slugify';
import template from '../llms/llms-full.md?raw';

const isPublished = (e: any) =>
  (e.data as any).publish !== false && (e.data as any).private !== true;

const titleOrId = (e: any) => (e.data as any).title || e.id.replace(/\.md$/, '');

export const GET: APIRoute = async () => {
  const site = import.meta.env.SITE ?? AppConfig.site ?? 'https://lossless.group';
  const base = import.meta.env.BASE_URL ?? '/';
  const root = new URL(base, site).toString().replace(/\/$/, '');

  // Each entry tagged with its collection key, URL builder, and human label.
  // URL builders mirror the page templates exactly so links resolve.
  type CollectionPlan = {
    key: string;
    label: string;
    fetch: () => Promise<any[]>;
    url: (e: any) => string;
  };

  const projectsUrl = (e: any) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    return `${root}/projects/${slug}/`;
  };
  const toolkitUrl = (e: any) => `${root}/toolkit/${getReferenceSlug(e.id)}/`;
  const verticalToolkitUrl = (e: any) =>
    `${root}/toolkit/vertical/${getReferenceSlug(e.id)}/`;
  const essayUrl = (e: any) => {
    const filename = e.id.replace(/\.md$/, '');
    const slug =
      (e.data as any).slug || filename.toLowerCase().replace(/\s+/g, '-');
    return `${root}/read/essays/${slug}/`;
  };
  const moreAboutUrl = (e: any) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    return `${root}/more-about/${slug}/`;
  };
  const vibeWithUrl = (collection: string, fullSlug: boolean) => (e: any) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    const finalSlug = fullSlug ? slug : (slug.split('/').pop() ?? slug);
    return `${root}/vibe-with/${collection}/${finalSlug}/`;
  };
  const explorationsUrl = (e: any) => {
    const slug = (e.data as any).slug || slugify((e.data as any).title || e.id);
    return `${root}/learn-with/explorations/${slug}/`;
  };
  const learnWithCollectionUrl = (urlPath: string) => (e: any) => {
    let slug =
      (e.data as any).slug || slugify((e.data as any).title || 'untitled-article');
    slug = slug.toLowerCase().replace(/\s+/g, '-');
    return `${root}/learn-with/${urlPath}/${slug}/`;
  };
  const upAndRunningUrl = (e: any) => {
    const slug =
      (e.data as any).slug || slugify((e.data as any).title || 'untitled-up-and-running');
    return `${root}/learn-with/up-and-running/with/${slug}/`;
  };
  const toHeroUrl = (e: any) => {
    const slug =
      (e.data as any).slug || slugify((e.data as any).title || 'untitled-to-hero');
    return `${root}/learn-with/zero-to/with/${slug}/`;
  };
  const marketMapUrl = (e: any) => {
    const slug =
      (e.data as any).slug || slugify((e.data as any).title || 'Untitled Market Map');
    return `${root}/market-map/for/${slug}/`;
  };
  const changelogUrl = (prefix: string) => (e: any) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    return `${root}/log/${prefix}-${slug}/`;
  };

  const plans: CollectionPlan[] = [
    {
      key: 'projects',
      label: 'Projects',
      fetch: () => getCollection('projects', ({ data }: any) => data.publish === true),
      url: projectsUrl,
    },
    {
      key: 'tooling',
      label: 'Tooling',
      fetch: () => getCollection('tooling').then((es) => es.filter(isPublished)),
      url: toolkitUrl,
    },
    {
      key: 'vertical-toolkits',
      label: 'Vertical Toolkits',
      fetch: () => getCollection('vertical-toolkits').then((es) => es.filter(isPublished)),
      url: verticalToolkitUrl,
    },
    {
      key: 'essays',
      label: 'Essays',
      fetch: () => getCollection('essays').then((es) => es.filter(isPublished)),
      url: essayUrl,
    },
    {
      key: 'concepts',
      label: 'Concepts',
      fetch: () => getCollection('concepts').then((es) => es.filter(isPublished)),
      url: moreAboutUrl,
    },
    {
      key: 'vocabulary',
      label: 'Vocabulary',
      fetch: () => getCollection('vocabulary').then((es) => es.filter(isPublished)),
      url: moreAboutUrl,
    },
    {
      key: 'explorations',
      label: 'Explorations',
      fetch: () => getCollection('explorations').then((es) => es.filter(isPublished)),
      url: explorationsUrl,
    },
    {
      key: 'blueprints',
      label: 'Blueprints',
      fetch: () => getCollection('blueprints').then((es) => es.filter(isPublished)),
      url: vibeWithUrl('blueprints', false),
    },
    {
      key: 'prompts',
      label: 'Prompts',
      fetch: () => getCollection('prompts').then((es) => es.filter(isPublished)),
      url: vibeWithUrl('prompts', true),
    },
    {
      key: 'specs',
      label: 'Specs',
      fetch: () => getCollection('specs').then((es) => es.filter(isPublished)),
      url: vibeWithUrl('specs', false),
    },
    {
      key: 'reminders',
      label: 'Reminders',
      fetch: () => getCollection('reminders').then((es) => es.filter(isPublished)),
      url: vibeWithUrl('reminders', false),
    },
    {
      key: 'issue-resolution',
      label: 'Issue Resolution',
      fetch: () => getCollection('issue-resolution').then((es) => es.filter(isPublished)),
      url: learnWithCollectionUrl('issue-resolution'),
    },
    {
      key: 'talks',
      label: 'Talks',
      fetch: () => getCollection('talks').then((es) => es.filter(isPublished)),
      url: learnWithCollectionUrl('our-talks'),
    },
    {
      key: 'up-and-running',
      label: 'Up and Running',
      fetch: () => getCollection('up-and-running').then((es) => es.filter(isPublished)),
      url: upAndRunningUrl,
    },
    {
      key: 'to-hero',
      label: 'Zero to Hero',
      fetch: () => getCollection('to-hero').then((es) => es.filter(isPublished)),
      url: toHeroUrl,
    },
    {
      key: 'market-maps',
      label: 'Market Maps',
      fetch: () => getCollection('market-maps').then((es) => es.filter(isPublished)),
      url: marketMapUrl,
    },
    {
      key: 'changelog--content',
      label: 'Content Changelog',
      fetch: () => getCollection('changelog--content').then((es) => es.filter(isPublished)),
      url: changelogUrl('content'),
    },
    {
      key: 'changelog--code',
      label: 'Code Changelog',
      fetch: () => getCollection('changelog--code').then((es) => es.filter(isPublished)),
      url: changelogUrl('code'),
    },
  ];

  // Fetch + flatten with metadata
  type Tagged = {
    plan: CollectionPlan;
    entry: any;
  };
  const tagged: Tagged[] = [];
  for (const plan of plans) {
    const entries = await plan.fetch();
    for (const entry of entries) {
      tagged.push({ plan, entry });
    }
  }

  // Sort by collection label, then title
  tagged.sort((a, b) => {
    if (a.plan.label !== b.plan.label) {
      return a.plan.label.localeCompare(b.plan.label);
    }
    return titleOrId(a.entry).toLowerCase().localeCompare(titleOrId(b.entry).toLowerCase());
  });

  const bodyParts: string[] = [];
  for (const { plan, entry } of tagged) {
    const data = entry.data as any;
    const title = titleOrId(entry);
    const url = plan.url(entry);

    bodyParts.push('---');
    bodyParts.push('');
    bodyParts.push(`## ${title}`);
    bodyParts.push('');
    bodyParts.push(`- Source collection: \`${plan.key}\``);
    bodyParts.push(`- Source path: \`${entry.id}\``);
    bodyParts.push(`- Canonical URL: ${url}`);
    if (data.date_modified) {
      const dm =
        data.date_modified instanceof Date
          ? data.date_modified
          : new Date(data.date_modified);
      if (!Number.isNaN(dm.getTime())) {
        bodyParts.push(`- Last modified: ${dm.toISOString().slice(0, 10)}`);
      }
    }
    bodyParts.push('');
    bodyParts.push(entry.body ?? '');
    bodyParts.push('');
  }

  const tokens: Record<string, string> = {
    SITE_NAME: AppConfig.author,
    ENTRY_COUNT: String(tagged.length),
    LLMS_INDEX_URL: `${root}/llms.txt`,
    CORPUS_BODIES: bodyParts.join('\n').trimEnd(),
  };

  const body = template.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(tokens, name) ? tokens[name] : match,
  );

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
