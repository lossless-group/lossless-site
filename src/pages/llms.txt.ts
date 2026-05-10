/**
 * /llms.txt — corpus link index for LLM consumers.
 *
 * Spec: https://llmstxt.org/
 *
 * The human-editable prose template lives at `src/llms/llms.md` (with token
 * documentation in `src/llms/README.md`). This file is the dumb assembler:
 * load template, compute dynamic values, substitute tokens.
 *
 * Site is on a custom domain (https://lossless.group), so URLs emit at the
 * host root with no base prefix.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { AppConfig } from '@utils/appConfig';
import { slugify, getReferenceSlug } from '@utils/slugify';
import template from '../llms/llms.md?raw';

// Same publish/private gate the page templates use. Most page templates use
// `data.publish !== false` (publish-by-default); a few use `publish === true`
// (e.g., projects/[...slug].astro). For the link index, we surface anything
// that wouldn't be hidden in any rendered HTML — i.e., publish is not false
// and private is not true. Per-collection routes that opt out of defaults
// will still hide drafts in their HTML; this is a deliberate widening of
// the index relative to publish-on-request collections.
const isPublished = (e: any) =>
  (e.data as any).publish !== false && (e.data as any).private !== true;

// Slug helpers mirroring how page templates compute URLs.
const titleOrId = (e: any) => (e.data as any).title || e.id.replace(/\.md$/, '');

const linkLine = (title: string, url: string, lede?: string | null) =>
  lede ? `- [${title}](${url}): ${lede}` : `- [${title}](${url})`;

const sectionLines = (title: string, lines: string[]): string[] => {
  if (lines.length === 0) return [];
  return [`### ${title}`, '', ...lines, ''];
};

const sortByTitle = (a: any, b: any) =>
  titleOrId(a).toLowerCase().localeCompare(titleOrId(b).toLowerCase());

export const GET: APIRoute = async () => {
  const site = import.meta.env.SITE ?? AppConfig.site ?? 'https://lossless.group';
  const base = import.meta.env.BASE_URL ?? '/';
  const root = new URL(base, site).toString().replace(/\/$/, '');

  // ---- Fetch all substantive collections ----
  const [
    projects,
    tooling,
    verticalToolkits,
    essays,
    concepts,
    vocabulary,
    explorations,
    blueprints,
    prompts,
    specs,
    reminders,
    issueResolution,
    talks,
    upAndRunning,
    toHero,
    marketMaps,
    changelogContent,
    changelogCode,
  ] = await Promise.all([
    getCollection('projects', ({ data }: any) => data.publish === true),
    getCollection('tooling').then((es) => es.filter(isPublished)),
    getCollection('vertical-toolkits').then((es) => es.filter(isPublished)),
    getCollection('essays').then((es) => es.filter(isPublished)),
    getCollection('concepts').then((es) => es.filter(isPublished)),
    getCollection('vocabulary').then((es) => es.filter(isPublished)),
    getCollection('explorations').then((es) => es.filter(isPublished)),
    getCollection('blueprints').then((es) => es.filter(isPublished)),
    getCollection('prompts').then((es) => es.filter(isPublished)),
    getCollection('specs').then((es) => es.filter(isPublished)),
    getCollection('reminders').then((es) => es.filter(isPublished)),
    getCollection('issue-resolution').then((es) => es.filter(isPublished)),
    getCollection('talks').then((es) => es.filter(isPublished)),
    getCollection('up-and-running').then((es) => es.filter(isPublished)),
    getCollection('to-hero').then((es) => es.filter(isPublished)),
    getCollection('market-maps').then((es) => es.filter(isPublished)),
    getCollection('changelog--content').then((es) => es.filter(isPublished)),
    getCollection('changelog--code').then((es) => es.filter(isPublished)),
  ]);

  // ---- URL builders per collection (mirror the page templates) ----

  // /projects/${slug}/ via processEntries -> resolveEntrySlug-like behavior
  const projectsUrl = (e: any) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    return `${root}/projects/${slug}/`;
  };

  // /toolkit/${pathSlug}/ where pathSlug = getReferenceSlug(entry.id) with
  // the leading "tooling/" stripped IF the id is rooted in the tooling dir.
  // The page template doesn't strip — it uses the full slug directly.
  const toolkitUrl = (e: any) => {
    const pathSlug = getReferenceSlug(e.id);
    return `${root}/toolkit/${pathSlug}/`;
  };

  // /toolkit/vertical/${slug}/
  const verticalToolkitUrl = (e: any) => {
    const slug = getReferenceSlug(e.id);
    return `${root}/toolkit/vertical/${slug}/`;
  };

  // /read/essays/${slug}/
  const essayUrl = (e: any) => {
    const filename = e.id.replace(/\.md$/, '');
    const slug =
      (e.data as any).slug || filename.toLowerCase().replace(/\s+/g, '-');
    return `${root}/read/essays/${slug}/`;
  };

  // /more-about/${slug}/ for vocabulary + concepts (uses processEntries slug)
  const moreAboutUrl = (e: any) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    return `${root}/more-about/${slug}/`;
  };

  // /vibe-with/${collection}/${filenameSlug}/ — for prompts the slug is full
  // path; for specs/reminders/blueprints it's the filename portion.
  const vibeWithUrl = (collection: string, e: any, fullSlug: boolean) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    const finalSlug = fullSlug ? slug : (slug.split('/').pop() ?? slug);
    return `${root}/vibe-with/${collection}/${finalSlug}/`;
  };

  // /learn-with/explorations/${slug}/
  const explorationsUrl = (e: any) => {
    const slug = (e.data as any).slug || slugify((e.data as any).title || e.id);
    return `${root}/learn-with/explorations/${slug}/`;
  };

  // /learn-with/our-talks/${slug}/ via collection-key 'talks'
  const talkUrl = (e: any) => {
    let slug =
      (e.data as any).slug || slugify((e.data as any).title || 'untitled-article');
    slug = slug.toLowerCase().replace(/\s+/g, '-');
    return `${root}/learn-with/our-talks/${slug}/`;
  };

  const issueResolutionUrl = (e: any) => {
    let slug =
      (e.data as any).slug || slugify((e.data as any).title || 'untitled-article');
    slug = slug.toLowerCase().replace(/\s+/g, '-');
    return `${root}/learn-with/issue-resolution/${slug}/`;
  };

  // /learn-with/up-and-running/with/${slug}/
  const upAndRunningUrl = (e: any) => {
    const slug =
      (e.data as any).slug || slugify((e.data as any).title || 'untitled-up-and-running');
    return `${root}/learn-with/up-and-running/with/${slug}/`;
  };

  // /learn-with/zero-to/with/${slug}/
  const toHeroUrl = (e: any) => {
    const slug =
      (e.data as any).slug || slugify((e.data as any).title || 'untitled-to-hero');
    return `${root}/learn-with/zero-to/with/${slug}/`;
  };

  // /market-map/for/${slug}/
  const marketMapUrl = (e: any) => {
    const slug =
      (e.data as any).slug || slugify((e.data as any).title || 'Untitled Market Map');
    return `${root}/market-map/for/${slug}/`;
  };

  // /log/${prefix}-${slug}/ — prefix is content-, code-, or laerdal-
  const changelogUrl = (e: any, prefix: string) => {
    const slug =
      (typeof (e.data as any)?.slug === 'string' && (e.data as any).slug.trim()) ||
      getReferenceSlug(e.id);
    return `${root}/log/${prefix}-${slug}/`;
  };

  // ---- Build per-section index lines ----

  const ledeOf = (e: any) =>
    (e.data as any).lede ?? (e.data as any).description ?? (e.data as any).summary;

  const buildLines = (
    entries: any[],
    urlOf: (e: any) => string,
  ): string[] => {
    const sorted = [...entries].sort(sortByTitle);
    return sorted.map((e) => linkLine(titleOrId(e), urlOf(e), ledeOf(e)));
  };

  // Projects section
  const projectsLines = buildLines(projects, projectsUrl);

  // Tooling: combine plain tooling + vertical-toolkits with subsection headers
  const toolingLines: string[] = [];
  toolingLines.push(...sectionLines('Tooling', buildLines(tooling, toolkitUrl)));
  toolingLines.push(
    ...sectionLines('Vertical Toolkits', buildLines(verticalToolkits, verticalToolkitUrl)),
  );

  // Writing: essays, concepts, vocabulary, explorations
  const writingLines: string[] = [];
  writingLines.push(...sectionLines('Essays', buildLines(essays, essayUrl)));
  writingLines.push(...sectionLines('Concepts', buildLines(concepts, moreAboutUrl)));
  writingLines.push(...sectionLines('Vocabulary', buildLines(vocabulary, moreAboutUrl)));
  writingLines.push(
    ...sectionLines('Explorations', buildLines(explorations, explorationsUrl)),
  );

  // Principles: blueprints, prompts, specs, reminders, issue-resolution
  const principlesLines: string[] = [];
  principlesLines.push(
    ...sectionLines(
      'Blueprints',
      buildLines(blueprints, (e) => vibeWithUrl('blueprints', e, false)),
    ),
  );
  principlesLines.push(
    ...sectionLines(
      'Prompts',
      buildLines(prompts, (e) => vibeWithUrl('prompts', e, true)),
    ),
  );
  principlesLines.push(
    ...sectionLines(
      'Specs',
      buildLines(specs, (e) => vibeWithUrl('specs', e, false)),
    ),
  );
  principlesLines.push(
    ...sectionLines(
      'Reminders',
      buildLines(reminders, (e) => vibeWithUrl('reminders', e, false)),
    ),
  );
  principlesLines.push(
    ...sectionLines('Issue Resolution', buildLines(issueResolution, issueResolutionUrl)),
  );

  // Talks, Guides, Market Maps
  const guidesLines: string[] = [];
  guidesLines.push(...sectionLines('Talks', buildLines(talks, talkUrl)));
  guidesLines.push(
    ...sectionLines('Up and Running', buildLines(upAndRunning, upAndRunningUrl)),
  );
  guidesLines.push(...sectionLines('Zero to Hero', buildLines(toHero, toHeroUrl)));
  guidesLines.push(...sectionLines('Market Maps', buildLines(marketMaps, marketMapUrl)));

  // Changelog: content + code (oldest-first within each subsection)
  const changelogLines: string[] = [];
  changelogLines.push(
    ...sectionLines(
      'Content Changelog',
      buildLines(changelogContent, (e) => changelogUrl(e, 'content')),
    ),
  );
  changelogLines.push(
    ...sectionLines(
      'Code Changelog',
      buildLines(changelogCode, (e) => changelogUrl(e, 'code')),
    ),
  );

  // ---- Counts ----
  const projectsCount = projects.length;
  const toolingCount = tooling.length + verticalToolkits.length;
  const writingCount =
    essays.length + concepts.length + vocabulary.length + explorations.length;
  const principlesCount =
    blueprints.length +
    prompts.length +
    specs.length +
    reminders.length +
    issueResolution.length;
  const guidesCount =
    talks.length + upAndRunning.length + toHero.length + marketMaps.length;
  const changelogCount = changelogContent.length + changelogCode.length;
  const entryCount =
    projectsCount + toolingCount + writingCount + principlesCount + guidesCount + changelogCount;

  // ---- Token map ----
  const tokens: Record<string, string> = {
    SITE_NAME: AppConfig.author,
    SITE_DESCRIPTION: AppConfig.description.replace(/\s+/g, ' ').trim(),
    ENTRY_COUNT: String(entryCount),
    PROJECTS_COUNT: String(projectsCount),
    TOOLING_COUNT: String(toolingCount),
    WRITING_COUNT: String(writingCount),
    PRINCIPLES_COUNT: String(principlesCount),
    GUIDES_COUNT: String(guidesCount),
    CHANGELOG_COUNT: String(changelogCount),
    PROJECTS_INDEX: projectsLines.join('\n').trimEnd(),
    TOOLING_INDEX: toolingLines.join('\n').trimEnd(),
    WRITING_INDEX: writingLines.join('\n').trimEnd(),
    PRINCIPLES_INDEX: principlesLines.join('\n').trimEnd(),
    GUIDES_INDEX: guidesLines.join('\n').trimEnd(),
    CHANGELOG_INDEX: changelogLines.join('\n').trimEnd(),
    LLMS_FULL_URL: `${root}/llms-full.txt`,
    LLMS_INDEX_URL: `${root}/llms.txt`,
  };

  const body = template.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(tokens, name) ? tokens[name] : match,
  );

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
