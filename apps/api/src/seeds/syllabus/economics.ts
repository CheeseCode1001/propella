import type { SubjectSeedData } from './types'

/**
 * Economics — JAMB, WAEC and NECO.
 *
 * Micro before macro, which is how it is taught and how the ideas build:
 * demand and supply first, then the firm, then the economy as a whole, then
 * the Nigerian economy specifically — which carries real weight on the paper.
 */
export const economics: SubjectSeedData = {
  slug: 'economics',
  name: 'Economics',
  hue: '#8E7F2B',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Economics for JAMB, WAEC and NECO: basic concepts, demand and supply, production and the firm, market structures, money and banking, public finance, and the Nigerian economy.',
  topics: [
    {
      slug: 'basic-economic-concepts',
      name: 'Basic Economic Concepts',
      order: 1,
      description:
        'Scarcity, choice, opportunity cost, scale of preference, and the basic economic problems every society faces.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'economic-systems',
      name: 'Economic Systems',
      order: 2,
      description:
        'Capitalist, socialist and mixed economies, how each answers what-how-for whom, and where Nigeria sits.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['basic-economic-concepts'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'economic-tools',
      name: 'Tools of Economic Analysis',
      order: 3,
      description:
        'Tables, graphs and charts, measures of central tendency and dispersion, and reading economic data correctly.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['basic-economic-concepts'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'demand',
      name: 'Theory of Demand',
      order: 4,
      description:
        'The law of demand, the demand curve, movement along versus shift of the curve, and the determinants of demand.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['economic-tools'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'supply',
      name: 'Theory of Supply',
      order: 5,
      description:
        'The law of supply, the supply curve, determinants of supply, and how supply behaves in the short and long run.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['demand'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'price-determination',
      name: 'Price Determination',
      order: 6,
      description:
        'Equilibrium price and quantity, surplus and shortage, and the effect of price control, subsidy and tax.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['supply'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'elasticity',
      name: 'Elasticity of Demand and Supply',
      order: 7,
      description:
        'Price, income and cross elasticity, calculating and interpreting the coefficient, and why elasticity matters for revenue.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['price-determination'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'theory-of-production',
      name: 'Theory of Production',
      order: 8,
      description:
        'Factors of production and their rewards, division of labour, the law of diminishing returns, and economies of scale.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['basic-economic-concepts'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'costs-revenue',
      name: 'Costs and Revenue',
      order: 9,
      description:
        'Fixed, variable, total, average and marginal cost; total, average and marginal revenue; and the break-even point.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['theory-of-production'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'business-organisations',
      name: 'Business Organisations',
      order: 10,
      description:
        'Sole proprietorship, partnership, limited companies, co-operatives and public corporations, and their advantages and drawbacks.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['theory-of-production'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'market-structures',
      name: 'Market Structures',
      order: 11,
      description:
        'Perfect competition, monopoly, monopolistic competition and oligopoly, and price and output under each.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['costs-revenue'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'national-income',
      name: 'National Income',
      order: 12,
      description:
        'GDP, GNP and NNP, the three methods of measurement, problems of measurement, and the circular flow of income.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['economic-tools'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'money',
      name: 'Money',
      order: 13,
      description:
        'Evolution and functions of money, qualities of good money, the demand for and supply of money, and the value of money.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['national-income'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'financial-institutions',
      name: 'Banking and Financial Institutions',
      order: 14,
      description:
        'Commercial banks and credit creation, the Central Bank of Nigeria and its functions, and other financial institutions.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['money'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'inflation-deflation',
      name: 'Inflation and Deflation',
      order: 15,
      description:
        'Types and causes of inflation, its effects on different groups, and the measures used to control it.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['money'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'public-finance',
      name: 'Public Finance',
      order: 16,
      description:
        'Sources of government revenue, types of expenditure, the budget, taxation and its principles, and public debt.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['national-income'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'international-trade',
      name: 'International Trade',
      order: 17,
      description:
        'Absolute and comparative advantage, balance of trade and payments, exchange rates, tariffs and trade restrictions.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['public-finance'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'economic-development',
      name: 'Economic Growth and Development',
      order: 18,
      description:
        'The difference between growth and development, indicators of development, development planning, and the obstacles Nigeria faces.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['national-income'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'population',
      name: 'Population',
      order: 19,
      description:
        'Population size, structure and census, the demographic transition, and over- and under-population in Nigeria.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['economic-development'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'agriculture-industry-nigeria',
      name: 'Agriculture and Industry in Nigeria',
      order: 20,
      description:
        'Agriculture in the Nigerian economy, industrialisation strategies, small-scale enterprise, and the petroleum sector.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['economic-development'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'economic-institutions-africa',
      name: 'Economic Institutions and Integration',
      order: 21,
      description:
        'ECOWAS, the African Union, OPEC, IMF and World Bank, and what economic integration offers Nigeria.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['international-trade'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
