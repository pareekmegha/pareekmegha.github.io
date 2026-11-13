import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One Markdown file per project. To add a project, copy an existing file in
// src/content/projects/, change the front matter, and write the story below it.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    question: z.string(),
    summary: z.string(),
    kind: z.enum(['Project', 'Internship', 'Startup']),
    year: z.string().optional(),
    hue: z.enum(['teal', 'coral', 'plum', 'mustard', 'leaf', 'sky', 'rose']),
    art: z.enum(['coins', 'taxi', 'trolley', 'megaphone', 'seed', 'heart', 'pages']),
    // Position in the default "Everything" order. Lower comes first.
    order: z.number(),
    // Rank within each role lens. Leave a lens out if the project is not relevant to it.
    lens: z
      .object({
        analytics: z.number().optional(),
        science: z.number().optional(),
        engineering: z.number().optional(),
        ai: z.number().optional(),
      })
      .default({}),
    tags: z.array(z.string()),
    stack: z.array(z.string()),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
    method: z.array(z.string()).default([]),
    limits: z.array(z.string()).default([]),
    exhibit: z.enum(['upi', 'shock', 'queue', 'toolkit']).optional(),
  }),
});

export const collections = { projects };
