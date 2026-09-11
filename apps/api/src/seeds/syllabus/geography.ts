import type { SubjectSeedData } from './types'

/**
 * Geography — JAMB, WAEC and NECO.
 *
 * Practical skills (map reading) first because they are examined separately
 * and are worth reliable marks; then physical geography, then human and
 * economic geography, then the regional geography of Nigeria and Africa.
 */
export const geography: SubjectSeedData = {
  slug: 'geography',
  name: 'Geography',
  hue: '#2F6B6B',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Geography for JAMB, WAEC and NECO: map reading and practical geography, physical geography, human and economic geography, and the regional geography of Nigeria and Africa.',
  topics: [
    {
      slug: 'map-reading',
      name: 'Map Reading and Interpretation',
      order: 1,
      description:
        'Scale and distance, direction and bearing, grid references, gradient, and describing relief and drainage from a map.',
      estimatedMinutes: 60,
      prerequisiteSlugs: [],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'statistical-maps',
      name: 'Statistical Maps and Diagrams',
      order: 2,
      description:
        'Bar and line graphs, pie charts, dot and choropleth maps, and choosing the right representation for a dataset.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['map-reading'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'earth-solar-system',
      name: 'The Earth and the Solar System',
      order: 3,
      description:
        'The solar system, the shape and size of the earth, rotation and revolution, and the consequences — day and night, seasons, time zones.',
      estimatedMinutes: 55,
      prerequisiteSlugs: [],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'latitude-longitude',
      name: 'Latitude, Longitude and Time',
      order: 4,
      description:
        'The grid of latitude and longitude, the International Date Line, and calculating local time from longitude.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['earth-solar-system'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'earth-structure-rocks',
      name: 'Structure of the Earth and Rocks',
      order: 5,
      description:
        'The internal structure of the earth, the three rock types and how each forms, and the rock cycle.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['earth-solar-system'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'landforms-processes',
      name: 'Landforms and Earth Processes',
      order: 6,
      description:
        'Earth movements, folding and faulting, volcanoes and earthquakes, and the landforms they produce.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['earth-structure-rocks'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'denudation',
      name: 'Weathering, Erosion and Deposition',
      order: 7,
      description:
        'Physical, chemical and biological weathering, and the work of rivers, wind, ice and the sea in shaping landscapes.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['landforms-processes'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'weather-climate',
      name: 'Weather and Climate',
      order: 8,
      description:
        'Elements of weather, instruments and the Stevenson screen, factors controlling climate, and climate classification.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['latitude-longitude'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'climate-types',
      name: 'World Climatic Regions',
      order: 9,
      description:
        'The equatorial, tropical, desert, Mediterranean and temperate regions, their characteristics and their vegetation.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['weather-climate'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'vegetation-soils',
      name: 'Vegetation and Soils',
      order: 10,
      description:
        'Major vegetation belts, soil formation and profile, soil types and erosion, and conservation methods.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['climate-types'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'environmental-hazards',
      name: 'Environmental Hazards and Resources',
      order: 11,
      description:
        'Drought, desertification, flooding, deforestation and pollution, and managing environmental resources.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['vegetation-soils'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'population-geography',
      name: 'Population and Settlement',
      order: 12,
      description:
        'Population distribution and density, migration, settlement types and patterns, and urbanisation and its problems.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['map-reading'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'agriculture-geography',
      name: 'Agriculture',
      order: 13,
      description:
        'Systems of agriculture, factors affecting agriculture, and the major crops and livestock of Nigeria and West Africa.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['vegetation-soils'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'mining-manufacturing',
      name: 'Mining and Manufacturing',
      order: 14,
      description:
        'Mineral resources of Nigeria, petroleum production, factors locating industry, and the main industrial areas.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['earth-structure-rocks'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'transport-trade-geography',
      name: 'Transport, Trade and Tourism',
      order: 15,
      description:
        'Transport networks in Nigeria and their problems, internal and external trade, and the tourism potential of the country.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['population-geography'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'regional-geography-nigeria',
      name: 'Regional Geography of Nigeria',
      order: 16,
      description:
        'Position, relief and drainage, climate and vegetation belts, states and resources, and Nigeria within West Africa.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['climate-types', 'population-geography'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'regional-geography-africa',
      name: 'Regional Geography of Africa',
      order: 17,
      description:
        'The physical setting of Africa, its climatic and vegetation regions, and the ECOWAS sub-region.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['regional-geography-nigeria'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'field-work',
      name: 'Field Work and Geographic Skills',
      order: 18,
      description:
        'Planning field work, collecting and recording data, and presenting findings in a report.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['statistical-maps'],
      examWeight: 0.03,
      examTypes: ['waec', 'neco'],
    },
  ],
}
