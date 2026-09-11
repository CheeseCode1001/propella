import type { SubjectSeedData } from './types'

/**
 * Literature in English — JAMB, WAEC and NECO.
 *
 * Deliberately teaches the tools before the set texts: a candidate who can
 * analyse theme, character and figurative language can handle whichever texts
 * the board prescribes that year, and the prescribed list changes.
 */
export const literature: SubjectSeedData = {
  slug: 'literature',
  name: 'Literature in English',
  hue: '#3F5A8E',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Literature in English for JAMB, WAEC and NECO: literary terms and devices, the three genres, African and non-African texts, and unseen passage analysis.',
  topics: [
    {
      slug: 'literary-terms',
      name: 'Literary Terms and Concepts',
      order: 1,
      description:
        'Plot, setting, theme, character, point of view, conflict and mood — the vocabulary every question is phrased in.',
      estimatedMinutes: 55,
      prerequisiteSlugs: [],
      examWeight: 0.12,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'figures-of-speech',
      name: 'Figures of Speech',
      order: 2,
      description:
        'Simile, metaphor, personification, irony, hyperbole, oxymoron, symbolism and more, and identifying them in an extract.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['literary-terms'],
      examWeight: 0.12,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'genres-overview',
      name: 'The Three Genres',
      order: 3,
      description:
        'What distinguishes prose, drama and poetry, and the sub-genres of each.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['literary-terms'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'prose-analysis',
      name: 'Studying Prose',
      order: 4,
      description:
        'Narrative technique, characterisation, plot structure and setting, and how to write about a novel you have studied.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['genres-overview'],
      examWeight: 0.12,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'drama-analysis',
      name: 'Studying Drama',
      order: 5,
      description:
        'Acts and scenes, dialogue and stage directions, dramatic irony and soliloquy, and tragedy versus comedy.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['genres-overview'],
      examWeight: 0.12,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'poetry-analysis',
      name: 'Studying Poetry',
      order: 6,
      description:
        'Stanza and line, rhyme and rhythm, metre, imagery and tone, and building a reading of a poem from its details.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['genres-overview', 'figures-of-speech'],
      examWeight: 0.12,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'african-prose',
      name: 'African Prose',
      order: 7,
      description:
        'Reading the prescribed African novel: its themes, characters, and the historical and cultural context it comes from.',
      estimatedMinutes: 65,
      prerequisiteSlugs: ['prose-analysis'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'non-african-prose',
      name: 'Non-African Prose',
      order: 8,
      description:
        'Reading the prescribed non-African novel, and comparing its concerns with the African text.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['prose-analysis'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'african-drama',
      name: 'African Drama',
      order: 9,
      description:
        'The prescribed African play: plot, characterisation, dramatic devices and themes.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['drama-analysis'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'non-african-drama',
      name: 'Non-African Drama',
      order: 10,
      description:
        'The prescribed non-African play, including Shakespearean language where it is set.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['drama-analysis'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'african-poetry',
      name: 'African Poetry',
      order: 11,
      description:
        'The prescribed African poems: themes, poetic devices, and the contexts that shaped them.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['poetry-analysis'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'non-african-poetry',
      name: 'Non-African Poetry',
      order: 12,
      description:
        'The prescribed non-African poems, and the forms — sonnet, ode, elegy — they are written in.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['poetry-analysis'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'unseen-passages',
      name: 'Unseen Passages',
      order: 13,
      description:
        'Analysing an extract you have never read: a method for working out theme, tone and device under time pressure.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['prose-analysis', 'poetry-analysis'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'oral-literature',
      name: 'Oral Literature',
      order: 14,
      description:
        'Folktales, proverbs, riddles, praise songs and myths, and the place of oral tradition in African literature.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['literary-terms'],
      examWeight: 0.05,
      examTypes: ['waec', 'neco'],
    },
  ],
}
