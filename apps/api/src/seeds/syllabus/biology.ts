import type { SubjectSeedData } from './types'

/**
 * Biology — JAMB/UTME, WAEC and NECO.
 *
 * Cell first, then how cells make tissues and organs, then the life processes
 * those organs carry out, then genetics and evolution, and ecology last —
 * which is the order the syllabus follows and the order the ideas build in.
 */
export const biology: SubjectSeedData = {
  slug: 'biology',
  name: 'Biology',
  hue: '#4F7A3F',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Biology for JAMB, WAEC and NECO: cell biology, classification, nutrition, transport, respiration, excretion, co-ordination, reproduction, genetics, evolution and ecology.',
  topics: [
    // ── The cell and organisation ────────────────────────────────────────
    {
      slug: 'living-things-characteristics',
      name: 'Characteristics of Living Things',
      order: 1,
      description:
        'The seven life processes, differences between living and non-living, and the concept of an organism.',
      estimatedMinutes: 40,
      prerequisiteSlugs: [],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'cell-structure',
      name: 'Cell Structure and Function',
      order: 2,
      description:
        'Plant and animal cell structure, the function of each organelle, and the differences between prokaryotic and eukaryotic cells.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['living-things-characteristics'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'cell-division',
      name: 'Cell Division',
      order: 3,
      description:
        'The cell cycle, the stages of mitosis and meiosis, and why meiosis matters for variation and gamete formation.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['cell-structure'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'cell-transport',
      name: 'Movement Across Cell Membranes',
      order: 4,
      description:
        'Diffusion, osmosis, active transport, plasmolysis and turgor, and osmoregulation in cells.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['cell-structure'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'levels-of-organisation',
      name: 'Levels of Organisation',
      order: 5,
      description:
        'From cell to tissue to organ to system to organism, plant and animal tissues, and complexity in organisms.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['cell-structure'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'classification',
      name: 'Classification of Living Things',
      order: 6,
      description:
        'The five kingdoms, the taxonomic hierarchy, binomial nomenclature, and the main features of each major group.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['levels-of-organisation'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Nutrition ────────────────────────────────────────────────────────
    {
      slug: 'plant-nutrition',
      name: 'Photosynthesis and Plant Nutrition',
      order: 7,
      description:
        'The photosynthesis equation, the light and dark stages, limiting factors, and testing a leaf for starch.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['cell-structure'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'animal-nutrition',
      name: 'Animal Nutrition',
      order: 8,
      description:
        'Classes of food and their sources, balanced diet, deficiency diseases, and modes of nutrition in animals.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['living-things-characteristics'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'digestive-system',
      name: 'Digestion and the Alimentary Canal',
      order: 9,
      description:
        'The human alimentary canal, digestive enzymes and what each acts on, absorption in the ileum, and assimilation.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['animal-nutrition'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'enzymes',
      name: 'Enzymes',
      order: 10,
      description:
        'Properties of enzymes, the lock-and-key model, the effect of temperature and pH, and enzymes in industry.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['cell-structure'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Transport, respiration, excretion ────────────────────────────────
    {
      slug: 'transport-plants',
      name: 'Transport in Plants',
      order: 11,
      description:
        'Xylem and phloem, uptake of water and minerals by roots, transpiration and the factors affecting it, and translocation.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['cell-transport'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'transport-animals',
      name: 'Transport in Animals',
      order: 12,
      description:
        'Blood composition, the heart and circulation, blood groups, clotting, and the lymphatic system.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['cell-transport'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'respiration',
      name: 'Respiration',
      order: 13,
      description:
        'Aerobic and anaerobic respiration, the respiratory organs in different organisms, gaseous exchange, and the mechanism of breathing.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['transport-animals'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'excretion',
      name: 'Excretion and Osmoregulation',
      order: 14,
      description:
        'Excretory products and organs, structure and function of the kidney and nephron, the skin and liver, and excretion in plants.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['transport-animals'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Co-ordination and support ────────────────────────────────────────
    {
      slug: 'nervous-system',
      name: 'The Nervous System',
      order: 15,
      description:
        'Neurones, the central and peripheral nervous systems, the reflex arc, and the brain and its parts.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['levels-of-organisation'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sense-organs',
      name: 'Sense Organs',
      order: 16,
      description:
        'Structure and function of the eye and ear, common eye defects and their correction, and the skin, tongue and nose.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['nervous-system'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'hormonal-coordination',
      name: 'Hormonal Co-ordination',
      order: 17,
      description:
        'Endocrine glands and their hormones, negative feedback, comparison with nervous control, and plant growth hormones.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['nervous-system'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'support-movement',
      name: 'Support and Movement',
      order: 18,
      description:
        'The skeleton and its functions, types of joint, muscles and how they work in antagonistic pairs, and support in plants.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['levels-of-organisation'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'homeostasis',
      name: 'Homeostasis',
      order: 19,
      description:
        'Maintaining a constant internal environment: temperature, blood sugar and water balance, and what happens when control fails.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['hormonal-coordination', 'excretion'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Reproduction and growth ──────────────────────────────────────────
    {
      slug: 'reproduction-plants',
      name: 'Reproduction in Plants',
      order: 20,
      description:
        'Asexual reproduction, the flower and its parts, pollination, fertilisation, and seed and fruit dispersal.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['cell-division'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'reproduction-animals',
      name: 'Reproduction in Animals',
      order: 21,
      description:
        'The human reproductive systems, the menstrual cycle, fertilisation and development, and birth control.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['cell-division'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'growth-development',
      name: 'Growth and Development',
      order: 22,
      description:
        'Seed germination and its conditions, measuring growth, growth curves, and metamorphosis in insects.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['reproduction-plants'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Genetics and evolution ───────────────────────────────────────────
    {
      slug: 'genetics-inheritance',
      name: 'Genetics and Inheritance',
      order: 23,
      description:
        "Genes and alleles, dominant and recessive traits, Mendel's laws, monohybrid and dihybrid crosses, and Punnett squares.",
      estimatedMinutes: 65,
      prerequisiteSlugs: ['cell-division'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'variation-applications',
      name: 'Variation and its Applications',
      order: 24,
      description:
        'Continuous and discontinuous variation, sex determination, sex-linked traits, blood groups, and applications in breeding and forensics.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['genetics-inheritance'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'evolution',
      name: 'Evolution',
      order: 25,
      description:
        'Evidence for evolution, Lamarck and Darwin, natural selection and adaptation, and how new species arise.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['variation-applications'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Ecology ──────────────────────────────────────────────────────────
    {
      slug: 'ecology-basics',
      name: 'Ecological Concepts',
      order: 26,
      description:
        'Habitat and niche, population and community, ecosystem and biosphere, and the biotic and abiotic factors of an environment.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['classification'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'energy-flow-nutrient-cycles',
      name: 'Energy Flow and Nutrient Cycles',
      order: 27,
      description:
        'Food chains and webs, trophic levels, ecological pyramids, and the carbon, nitrogen and water cycles.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['ecology-basics'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'ecological-associations',
      name: 'Ecological Associations and Adaptation',
      order: 28,
      description:
        'Symbiosis, parasitism, commensalism and competition; adaptations to aquatic and terrestrial habitats; and Nigerian vegetation zones.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['ecology-basics'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'conservation-pollution',
      name: 'Conservation and Pollution',
      order: 29,
      description:
        'Natural resources and their conservation, types and effects of pollution, and human impact on Nigerian ecosystems.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['energy-flow-nutrient-cycles'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'micro-organisms-disease',
      name: 'Micro-organisms, Health and Disease',
      order: 30,
      description:
        'Beneficial and harmful micro-organisms, common Nigerian diseases and their vectors, immunity, and personal and public hygiene.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['classification'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
