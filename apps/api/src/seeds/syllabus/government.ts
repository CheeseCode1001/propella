import type { SubjectSeedData } from './types'

/**
 * Government — JAMB, WAEC and NECO.
 *
 * Concepts and structures first, then Nigerian constitutional development in
 * chronological order, then foreign policy and international organisations.
 * The Nigerian history section is roughly half the paper, so it is weighted
 * accordingly and kept in date order rather than by theme.
 */
export const government: SubjectSeedData = {
  slug: 'government',
  name: 'Government',
  hue: '#7F4A35',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Government for JAMB, WAEC and NECO: basic concepts, forms and organs of government, constitutions, political processes, Nigerian constitutional development, and international relations.',
  topics: [
    {
      slug: 'basic-concepts-government',
      name: 'Basic Concepts',
      order: 1,
      description:
        'Power, authority, legitimacy, sovereignty, the state and the nation, and how these ideas relate to one another.',
      estimatedMinutes: 50,
      prerequisiteSlugs: [],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'forms-of-government',
      name: 'Forms of Government',
      order: 2,
      description:
        'Democracy, monarchy, aristocracy, oligarchy, totalitarianism and military rule, with their features and shortcomings.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['basic-concepts-government'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'organs-of-government',
      name: 'Organs of Government',
      order: 3,
      description:
        'The legislature, executive and judiciary; separation of powers; and checks and balances in practice.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['forms-of-government'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'systems-of-government',
      name: 'Systems of Government',
      order: 4,
      description:
        'Unitary, federal and confederal systems; presidential versus parliamentary; and why Nigeria adopted federalism.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['organs-of-government'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'constitution',
      name: 'Constitutions',
      order: 5,
      description:
        'Types of constitution, sources, the rule of law, constitutionalism, and fundamental human rights.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['systems-of-government'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'political-parties',
      name: 'Political Parties and Party Systems',
      order: 6,
      description:
        'Functions of political parties, one-, two- and multi-party systems, and pressure groups and public opinion.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['forms-of-government'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'electoral-process',
      name: 'Elections and the Electoral Process',
      order: 7,
      description:
        'Suffrage, electoral systems, functions of an electoral commission, and the problems of elections in Nigeria.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['political-parties'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'public-administration',
      name: 'Public Administration',
      order: 8,
      description:
        'The civil service, public corporations and parastatals, local government, and bureaucracy and its problems.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['organs-of-government'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'pre-colonial-systems',
      name: 'Pre-Colonial Nigerian Political Systems',
      order: 9,
      description:
        'Governance among the Hausa-Fulani, Yoruba and Igbo before colonial rule, and how centralised each system was.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['systems-of-government'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'colonial-administration',
      name: 'Colonial Administration',
      order: 10,
      description:
        'British colonisation, indirect rule and its consequences, the 1914 amalgamation, and how Nigerians responded.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['pre-colonial-systems'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'colonial-constitutions',
      name: 'Colonial Constitutions',
      order: 11,
      description:
        'The Clifford, Richards, Macpherson and Lyttleton constitutions, and what each changed on the road to independence.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['colonial-administration'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'nationalism-independence',
      name: 'Nationalism and Independence',
      order: 12,
      description:
        'The nationalist movements, the early political parties and their leaders, and the path to independence in 1960.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['colonial-constitutions'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'first-republic',
      name: 'The First Republic and Military Rule',
      order: 13,
      description:
        'The 1963 republican constitution, the crises of the First Republic, the coups of 1966, and the civil war.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['nationalism-independence'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'second-third-republic',
      name: 'The Second and Third Republics',
      order: 14,
      description:
        'The 1979 constitution and presidential system, the Second Republic and its collapse, and the annulled Third Republic transition.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['first-republic'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'fourth-republic',
      name: 'The Fourth Republic',
      order: 15,
      description:
        'The 1999 constitution, the structure of the current federation, and the challenges of civilian rule since 1999.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['second-third-republic'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'nigerian-foreign-policy',
      name: 'Nigerian Foreign Policy',
      order: 16,
      description:
        'The objectives and determinants of Nigeria\'s foreign policy, Africa as its centrepiece, and non-alignment.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['fourth-republic'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'international-organisations',
      name: 'International Organisations',
      order: 17,
      description:
        'The UN, AU, ECOWAS, Commonwealth and OPEC: their structures, aims and what Nigeria contributes to each.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['nigerian-foreign-policy'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
