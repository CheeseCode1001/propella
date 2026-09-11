import type { SubjectSeedData } from './types'

/**
 * English Language — compulsory for every JAMB, WAEC and NECO candidate.
 *
 * Comprehension and vocabulary carry the most marks on the UTME paper, so they
 * come first and are weighted accordingly. The WAEC/NECO paper adds essay and
 * oral English, which are tagged to those exams only.
 */
export const english: SubjectSeedData = {
  slug: 'english',
  name: 'English Language',
  hue: '#3F5B7F',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Use of English for JAMB, WAEC and NECO: comprehension, summary, vocabulary, grammar and structure, essay writing and oral English.',
  topics: [
    {
      slug: 'comprehension',
      name: 'Comprehension',
      order: 1,
      description:
        'Reading a passage closely, answering literal and inferential questions, and working out what a phrase means in context.',
      estimatedMinutes: 60,
      prerequisiteSlugs: [],
      examWeight: 0.12,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'summary-writing',
      name: 'Summary Writing',
      order: 2,
      description:
        'Finding the main points of a passage and restating them in your own words, to a set number of sentences.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['comprehension'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'parts-of-speech',
      name: 'Parts of Speech',
      order: 3,
      description:
        'Nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions and interjections, and how each behaves in a sentence.',
      estimatedMinutes: 55,
      prerequisiteSlugs: [],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sentence-structure',
      name: 'Sentence Structure',
      order: 4,
      description:
        'Phrases and clauses, simple, compound and complex sentences, and the functions of subordinate clauses.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['parts-of-speech'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'concord',
      name: 'Concord',
      order: 5,
      description:
        'Subject-verb agreement, including the cases that catch candidates out: collective nouns, indefinite pronouns and "neither… nor".',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['sentence-structure'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'tenses',
      name: 'Tenses and Verb Forms',
      order: 6,
      description:
        'The twelve tenses, sequence of tenses in reported speech, and the difference between active and passive voice.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['parts-of-speech'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'vocabulary-synonyms-antonyms',
      name: 'Vocabulary: Synonyms and Antonyms',
      order: 7,
      description:
        'Choosing the word nearest in meaning or most nearly opposite — the largest single section of the UTME paper.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['comprehension'],
      examWeight: 0.12,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'idioms-figurative',
      name: 'Idioms and Figurative Expressions',
      order: 8,
      description:
        'Common English idioms and what they actually mean, plus the figures of speech that appear in comprehension questions.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['vocabulary-synonyms-antonyms'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'lexis-structure',
      name: 'Lexis and Structure',
      order: 9,
      description:
        'Completing sentences with the right word or phrase, phrasal verbs, and register — the language of a particular field.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['sentence-structure'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'punctuation-mechanics',
      name: 'Punctuation and Mechanics',
      order: 10,
      description:
        'Full stops, commas, apostrophes, colons and semicolons, capitalisation, and spelling patterns worth memorising.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['sentence-structure'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'oral-english-vowels',
      name: 'Oral English: Vowels and Consonants',
      order: 11,
      description:
        'Vowel and consonant sounds, the phonetic symbols used in the paper, and the sounds Nigerian speakers most often confuse.',
      estimatedMinutes: 55,
      prerequisiteSlugs: [],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'oral-english-stress',
      name: 'Oral English: Stress and Intonation',
      order: 12,
      description:
        'Word stress, emphatic stress, rhyme, and the intonation patterns of statements and questions.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['oral-english-vowels'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'essay-writing',
      name: 'Essay Writing',
      order: 13,
      description:
        'Narrative, descriptive, expository and argumentative essays: planning, paragraphing, and writing to the marking scheme.',
      estimatedMinutes: 65,
      prerequisiteSlugs: ['punctuation-mechanics'],
      examWeight: 0.04,
      examTypes: ['waec', 'neco'],
    },
    {
      slug: 'letter-writing',
      name: 'Letter and Report Writing',
      order: 14,
      description:
        'Formal and informal letters, articles, speeches and reports — the format marks and the register each one needs.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['essay-writing'],
      examWeight: 0.03,
      examTypes: ['waec', 'neco'],
    },
  ],
}
