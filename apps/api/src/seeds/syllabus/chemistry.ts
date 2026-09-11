import type { SubjectSeedData } from './types'

/**
 * Chemistry — JAMB/UTME, WAEC and NECO.
 *
 * Physical chemistry first (particles, bonding, the mole), because every
 * calculation later depends on it; then inorganic by group; then organic,
 * which is taught last and assumes bonding and structure throughout.
 */
export const chemistry: SubjectSeedData = {
  slug: 'chemistry',
  name: 'Chemistry',
  hue: '#8E5A2B',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Chemistry for JAMB, WAEC and NECO: atomic structure and bonding, stoichiometry, states of matter, energetics, rates and equilibrium, inorganic chemistry by group, and organic chemistry.',
  topics: [
    // ── Foundations ──────────────────────────────────────────────────────
    {
      slug: 'separation-techniques',
      name: 'Separation of Mixtures',
      order: 1,
      description:
        'Filtration, evaporation, distillation, fractional distillation, sublimation and chromatography, and choosing the right method for a mixture.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'atomic-structure',
      name: 'Atomic Structure',
      order: 2,
      description:
        'Protons, neutrons and electrons; atomic and mass number; isotopes and relative atomic mass; and electron configuration.',
      estimatedMinutes: 55,
      prerequisiteSlugs: [],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'periodic-table',
      name: 'The Periodic Table and Periodicity',
      order: 3,
      description:
        'Groups and periods, and the trends in atomic radius, ionisation energy, electronegativity and metallic character.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['atomic-structure'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'chemical-bonding',
      name: 'Chemical Bonding',
      order: 4,
      description:
        'Ionic, covalent, co-ordinate and metallic bonding, hydrogen bonding and van der Waals forces, and how bonding explains physical properties.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['periodic-table'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'kinetic-theory-states',
      name: 'Kinetic Theory and States of Matter',
      order: 5,
      description:
        'The kinetic theory, changes of state, and the difference between a solid, liquid and gas at particle level.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['chemical-bonding'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'gas-laws-chemistry',
      name: 'Gas Laws',
      order: 6,
      description:
        "Boyle's, Charles's and Gay-Lussac's laws, the ideal gas equation, Dalton's law of partial pressures, and Graham's law of diffusion.",
      estimatedMinutes: 55,
      prerequisiteSlugs: ['kinetic-theory-states'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Stoichiometry ────────────────────────────────────────────────────
    {
      slug: 'chemical-formulae-equations',
      name: 'Chemical Formulae and Equations',
      order: 7,
      description:
        'Writing formulae from valency, balancing equations, and the laws of conservation of mass and definite proportions.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['chemical-bonding'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'mole-concept',
      name: 'The Mole Concept',
      order: 8,
      description:
        "Avogadro's number, molar mass, molar volume at s.t.p., and converting between mass, moles and number of particles.",
      estimatedMinutes: 65,
      prerequisiteSlugs: ['chemical-formulae-equations'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'stoichiometry-calculations',
      name: 'Stoichiometry and Reacting Masses',
      order: 9,
      description:
        'Empirical and molecular formulae, reacting mass and volume calculations, limiting reagent and percentage yield.',
      estimatedMinutes: 65,
      prerequisiteSlugs: ['mole-concept'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'solutions-solubility',
      name: 'Solutions and Solubility',
      order: 10,
      description:
        'Concentration in mol/dm³ and g/dm³, standard solutions, solubility curves, and saturated and supersaturated solutions.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['mole-concept'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Reaction chemistry ───────────────────────────────────────────────
    {
      slug: 'acids-bases-salts',
      name: 'Acids, Bases and Salts',
      order: 11,
      description:
        'Properties of acids and bases, the pH scale, indicators, neutralisation, and preparing soluble and insoluble salts.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['solutions-solubility'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'volumetric-analysis',
      name: 'Volumetric Analysis',
      order: 12,
      description:
        'Acid-base titration, choosing an indicator, titration calculations, and the practical technique itself.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['acids-bases-salts'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'oxidation-reduction',
      name: 'Oxidation and Reduction',
      order: 13,
      description:
        'Oxidation numbers, identifying oxidising and reducing agents, and balancing redox equations by half-reactions.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['chemical-formulae-equations'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'electrolysis',
      name: 'Electrolysis and Electrochemical Cells',
      order: 14,
      description:
        "Electrolytes, selective discharge, Faraday's laws, the electrochemical series, and simple cells and corrosion.",
      estimatedMinutes: 60,
      prerequisiteSlugs: ['oxidation-reduction'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'energy-changes',
      name: 'Energy Changes in Reactions',
      order: 15,
      description:
        "Exothermic and endothermic reactions, enthalpy change, energy profile diagrams, and Hess's law.",
      estimatedMinutes: 55,
      prerequisiteSlugs: ['chemical-formulae-equations'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'rates-of-reaction',
      name: 'Rates of Reaction',
      order: 16,
      description:
        'Factors affecting rate, collision theory, activation energy, and how a catalyst works.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['energy-changes'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'chemical-equilibrium',
      name: 'Chemical Equilibrium',
      order: 17,
      description:
        "Reversible reactions, dynamic equilibrium, Le Chatelier's principle, and applying it to the Haber and Contact processes.",
      estimatedMinutes: 55,
      prerequisiteSlugs: ['rates-of-reaction'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Inorganic chemistry ──────────────────────────────────────────────
    {
      slug: 'water-hardness',
      name: 'Water and Water Treatment',
      order: 18,
      description:
        'Water as a solvent, temporary and permanent hardness and how to remove it, and treatment of town water supply.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['solutions-solubility'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'air-and-oxygen',
      name: 'Air, Oxygen and Hydrogen',
      order: 19,
      description:
        'Composition of air, laboratory preparation and properties of oxygen and hydrogen, oxides, rusting and air pollution.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['oxidation-reduction'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'group-1-2-elements',
      name: 'Alkali and Alkaline Earth Metals',
      order: 20,
      description:
        'Trends down groups 1 and 2, reactions with water, oxygen and acids, and the important compounds of sodium and calcium.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['periodic-table'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'halogens',
      name: 'The Halogens',
      order: 21,
      description:
        'Trends down group 7, preparation and properties of chlorine, displacement reactions, and uses of the halogens.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['periodic-table'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'nitrogen-compounds',
      name: 'Nitrogen and its Compounds',
      order: 22,
      description:
        'The nitrogen cycle, preparation and properties of ammonia and nitrogen(IV) oxide, the Haber process, and nitric acid.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['chemical-equilibrium'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sulphur-compounds',
      name: 'Sulphur and its Compounds',
      order: 23,
      description:
        'Allotropes of sulphur, sulphur(IV) oxide, the Contact process, and the properties of concentrated tetraoxosulphate(VI) acid.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['chemical-equilibrium'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'carbon-compounds-inorganic',
      name: 'Carbon and its Inorganic Compounds',
      order: 24,
      description:
        'Allotropes of carbon, carbon(II) and carbon(IV) oxides, trioxocarbonates, and the greenhouse effect.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['air-and-oxygen'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'metals-extraction',
      name: 'Metals and Extraction',
      order: 25,
      description:
        'The activity series, extraction of iron in the blast furnace, extraction of aluminium, alloys, and Nigerian mineral resources.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['electrolysis'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'qualitative-analysis',
      name: 'Qualitative Analysis',
      order: 26,
      description:
        'Confirmatory tests for common cations and anions, flame tests, and the reasoning behind an unknown-salt question.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['acids-bases-salts'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Organic chemistry ────────────────────────────────────────────────
    {
      slug: 'organic-introduction',
      name: 'Introduction to Organic Chemistry',
      order: 27,
      description:
        'Why carbon is special, homologous series, functional groups, IUPAC nomenclature, and isomerism.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['chemical-bonding'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'alkanes',
      name: 'Alkanes',
      order: 28,
      description:
        'Saturated hydrocarbons, their general formula and properties, substitution reactions, and petroleum refining and cracking.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['organic-introduction'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'alkenes-alkynes',
      name: 'Alkenes and Alkynes',
      order: 29,
      description:
        'Unsaturated hydrocarbons, addition reactions, the test with bromine water, and addition polymerisation.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['alkanes'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'alkanols-alkanals',
      name: 'Alkanols, Alkanals and Alkanones',
      order: 30,
      description:
        'Primary, secondary and tertiary alkanols, oxidation products, fermentation, and tests that tell aldehydes from ketones.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['alkenes-alkynes'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'alkanoic-acids-esters',
      name: 'Alkanoic Acids and Esters',
      order: 31,
      description:
        'Carboxylic acids and their reactions, esterification, hydrolysis, saponification, and how soap and detergents work.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['alkanols-alkanals'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'biomolecules-polymers',
      name: 'Biomolecules and Polymers',
      order: 32,
      description:
        'Carbohydrates, proteins, fats and oils, natural and synthetic polymers, and the plastics problem.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['alkanoic-acids-esters'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
