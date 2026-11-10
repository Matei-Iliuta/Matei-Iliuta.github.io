import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/projects/.
// Everything the project page shows comes from the front matter of that file.
const entry = z.object({
  date: z.string(),
  title: z.string(),
  text: z.string(),
  // One-line version for the Short view of the devlog
  short: z.string().optional(),
  // Key entries keep their full text and photo in the Short view
  key: z.boolean().default(false),
  // Only on the This site page, not in the project's own devlog
  siteOnly: z.boolean().default(false),
  // Optional photo under the entry (click to enlarge)
  photo: z
    .object({
      src: z.string(),
      webp: z.string().optional(),
      width: z.number(),
      height: z.number(),
      alt: z.string(),
      caption: z.string().optional(),
    })
    .optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    // Three short facts under the summary, for people who only skim
    keyFacts: z.array(z.string()).max(4).default([]),
    // Switching this value flips the page between its two versions. The URL stays the same.
    status: z.enum(['in-progress', 'completed']),
    order: z.number().default(0),
    // A component page lives inside a bigger project: its folder name (e.g. desk-robot)
    parent: z.string().optional(),
    year: z.number(),
    started: z.string(),
    lastUpdated: z.string().optional(),
    finished: z.string().optional(),
    duration: z.string().optional(),
    stack: z.array(z.string()),
    hero: z.object({
      // in progress: a photo from the bench
      photo: z.string().optional(),
      // optional second photo shown next to the first
      photo2: z.string().optional(),
      photo2Alt: z.string().optional(),
      photoPlaceholder: z.string().default('[Current photo of the build, from the bench]'),
      photoCaption: z.string(),
      // completed: the final video
      video: z.string().optional(),
      videoPlaceholder: z.string().default('[Short video of the finished build running]'),
      videoCaption: z.string().default('Final build'),
    }),
    result: z.string().optional(),
    why: z.string(),
    // Newest first. Never delete old entries: the full history stays on the page.
    devlog: z.array(entry),
    // Added on top of the devlog once the project is completed
    finalEntry: entry.optional(),
    schematic: z.string().optional(),
    schematicPlaceholder: z.string().default('[Schematic]'),
    code: z.string(),
    problem: z.string(),
    lesson: z.string(),
    // Shown as PROGRESS while in progress and as MILESTONES once completed
    progress: z.number().min(0).max(100).default(0),
    steps: z.array(
      z.object({
        label: z.string(),
        state: z.enum(['done', 'doing', 'next']),
        date: z.string().default('[date]'),
      }),
    ),
    // Small changes after a completed project, newest first (for things that keep evolving, like this site)
    updates: z.array(z.object({ date: z.string(), text: z.string() })).default([]),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    parts: z.array(z.object({ name: z.string(), qty: z.string() })),
    github: z.string().optional(),
  }),
});

export const collections = { projects };
