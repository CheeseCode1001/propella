import type { SubjectSeedData } from './types'

/**
 * Agricultural Science — JAMB, WAEC and NECO.
 *
 * Soil and land first, since crop and animal production both depend on it,
 * then crops, then livestock, then the economics and management side.
 */
export const agriculturalScience: SubjectSeedData = {
  slug: 'agricultural-science',
  name: 'Agricultural Science',
  hue: '#4F7A3F',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Agricultural Science for JAMB, WAEC and NECO: soil science, crop production, animal production, agricultural engineering, and agricultural economics and extension.',
  topics: [
    {
      slug: 'meaning-scope-agriculture',
      name: 'Meaning and Scope of Agriculture',
      order: 1,
      description:
        'Branches of agriculture, its importance to the Nigerian economy, and the problems facing agricultural development.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'agricultural-systems',
      name: 'Systems and Practices of Agriculture',
      order: 2,
      description:
        'Shifting cultivation, bush fallowing, mixed farming, crop rotation, and subsistence versus commercial farming.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['meaning-scope-agriculture'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'soil-science',
      name: 'Soil Science',
      order: 3,
      description:
        'Soil formation and profile, physical and chemical properties, soil texture and structure, and soil organisms.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['meaning-scope-agriculture'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'soil-fertility',
      name: 'Soil Fertility and Plant Nutrition',
      order: 4,
      description:
        'Macro and micro nutrients, deficiency symptoms, organic manure and inorganic fertilisers, and maintaining fertility.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['soil-science'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'soil-erosion-conservation',
      name: 'Soil Erosion and Conservation',
      order: 5,
      description:
        'Types and causes of erosion, its effects on Nigerian farmland, and the control and conservation measures that work.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['soil-science'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'irrigation-drainage',
      name: 'Irrigation and Drainage',
      order: 6,
      description:
        'Why irrigation matters in northern Nigeria, the main irrigation methods, drainage systems, and water conservation.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['soil-science'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'agricultural-ecology',
      name: 'Agricultural Ecology',
      order: 7,
      description:
        'Climatic factors affecting agriculture, ecological zones of Nigeria, and matching crops to their environment.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['soil-science'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'crop-production',
      name: 'Crop Production',
      order: 8,
      description:
        'Classification of crops, land preparation, planting, nursery practice, and cultural practices through the growing season.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['soil-fertility'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'crop-improvement',
      name: 'Crop Improvement',
      order: 9,
      description:
        'Aims of crop improvement, methods of plant breeding, selection and hybridisation, and the value of improved varieties.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['crop-production'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'pests-diseases-crops',
      name: 'Crop Pests and Diseases',
      order: 10,
      description:
        'Major pests and diseases of Nigerian crops, the damage they cause, and chemical, biological and cultural control.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['crop-production'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'weeds',
      name: 'Weeds and Weed Control',
      order: 11,
      description:
        'What makes a plant a weed, how weeds spread, their effects on yield, and the methods of control.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['crop-production'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'forestry',
      name: 'Forestry and Agroforestry',
      order: 12,
      description:
        'Forest resources and their uses, forest regulations, afforestation, and agroforestry practice.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['agricultural-ecology'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'animal-production',
      name: 'Animal Production',
      order: 13,
      description:
        'Classification of farm animals, their anatomy and physiology, and the systems used to keep them.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['meaning-scope-agriculture'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'animal-nutrition-agric',
      name: 'Animal Nutrition',
      order: 14,
      description:
        'Feed classes and nutrients, ration formulation, feeding at different stages, and deficiency symptoms.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['animal-production'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'animal-health',
      name: 'Animal Health and Diseases',
      order: 15,
      description:
        'Common diseases and parasites of Nigerian livestock, their symptoms, and prevention and treatment.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['animal-production'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'animal-improvement',
      name: 'Animal Improvement and Reproduction',
      order: 16,
      description:
        'Reproduction in farm animals, breeding methods, artificial insemination, and selection for better stock.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['animal-production'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'fisheries-apiculture',
      name: 'Fisheries and Apiculture',
      order: 17,
      description:
        'Fish farming and capture fisheries in Nigeria, pond management, and beekeeping and its products.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['animal-production'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'farm-machinery',
      name: 'Farm Tools, Machinery and Power',
      order: 18,
      description:
        'Simple farm tools and their maintenance, tractors and implements, and sources of farm power.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['agricultural-systems'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'farm-structures',
      name: 'Farm Structures and Surveying',
      order: 19,
      description:
        'Farmstead layout, animal housing, storage structures, and basic farm surveying and planning.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['farm-machinery'],
      examWeight: 0.04,
      examTypes: ['waec', 'neco'],
    },
    {
      slug: 'agricultural-economics',
      name: 'Agricultural Economics',
      order: 20,
      description:
        'Demand and supply of farm products, farm records and accounts, marketing of produce, and agricultural finance.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['crop-production', 'animal-production'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'farm-management',
      name: 'Farm Management',
      order: 21,
      description:
        'The functions of a farm manager, planning and budgeting, land tenure systems in Nigeria, and farm risk.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['agricultural-economics'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'agricultural-extension',
      name: 'Agricultural Extension',
      order: 22,
      description:
        'The role of extension services, teaching methods used with farmers, and the agencies supporting Nigerian agriculture.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['farm-management'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
