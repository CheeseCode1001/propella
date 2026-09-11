import type { SubjectSeedData } from './types'

/**
 * Commerce — JAMB, WAEC and NECO.
 *
 * Starts with what commerce is and who takes part, then the trade chain, then
 * the aids to trade that make it work, then business finance and the
 * Nigerian commercial environment.
 */
export const commerce: SubjectSeedData = {
  slug: 'commerce',
  name: 'Commerce',
  hue: '#8E5A2B',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Commerce for JAMB, WAEC and NECO: trade and the trade chain, business organisations, aids to trade, business finance, and the Nigerian commercial environment.',
  topics: [
    {
      slug: 'nature-of-commerce',
      name: 'Nature and Scope of Commerce',
      order: 1,
      description:
        'Commerce, trade and industry defined, the branches of production, and the place of commerce in an economy.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'occupations',
      name: 'Occupations',
      order: 2,
      description:
        'Industrial, commercial and service occupations, and how specialisation and interdependence arise.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['nature-of-commerce'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'home-trade',
      name: 'Home Trade',
      order: 3,
      description:
        'Wholesale and retail trade, types of retailer, the functions of the middleman, and why disintermediation happens.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['nature-of-commerce'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'foreign-trade',
      name: 'Foreign Trade',
      order: 4,
      description:
        'Import, export and entrepot trade, balance of trade and payments, and the documents used in foreign trade.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['home-trade'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'business-units',
      name: 'Business Units',
      order: 5,
      description:
        'Sole trader, partnership, private and public limited companies, co-operatives and public enterprises.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['nature-of-commerce'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'trade-documents',
      name: 'Trade Documents and Terms',
      order: 6,
      description:
        'Enquiry, quotation, order, invoice, credit and debit notes, and terms such as COD, FOB, CIF and E&OE.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['home-trade'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'transportation',
      name: 'Transportation',
      order: 7,
      description:
        'Road, rail, water, air and pipeline transport, their merits and demerits, and containerisation.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['home-trade'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'communication',
      name: 'Communication',
      order: 8,
      description:
        'Means of communication in business, the postal and telecommunication services, and the effect of ICT on trade.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['transportation'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'warehousing',
      name: 'Warehousing',
      order: 9,
      description:
        'Functions and types of warehouse, bonded warehouses, and the role of storage in smoothing supply.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['transportation'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'advertising-marketing',
      name: 'Advertising and Marketing',
      order: 10,
      description:
        'Types and media of advertising, sales promotion, the marketing mix, and market research.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['home-trade'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'insurance',
      name: 'Insurance',
      order: 11,
      description:
        'Principles of insurance, types of policy, the difference between insurance and assurance, and the role of re-insurance.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['nature-of-commerce'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'banking-commerce',
      name: 'Banking',
      order: 12,
      description:
        'Types of bank and bank account, the instruments of payment, and the services banks provide to traders.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['trade-documents'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'money-capital-markets',
      name: 'Money and Capital Markets',
      order: 13,
      description:
        'The money market and capital market, the Nigerian Stock Exchange, shares and debentures, and how to buy them.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['banking-commerce'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'business-finance',
      name: 'Business Finance',
      order: 14,
      description:
        'Sources of short, medium and long term finance, working capital, and choosing the right source for a need.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['money-capital-markets'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'business-documents-accounts',
      name: 'Elements of Business Accounts',
      order: 15,
      description:
        'The trading, profit and loss account and the balance sheet, and simple ratios such as gross and net profit margin.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['business-finance'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'business-management',
      name: 'Elements of Business Management',
      order: 16,
      description:
        'Functions of management, organisational structure, staff motivation, and the departments of a business.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['business-units'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'consumer-protection',
      name: 'Consumer Protection',
      order: 17,
      description:
        'Consumer rights, the agencies that enforce them in Nigeria, and the law against unfair trade practices.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['advertising-marketing'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'commercial-environment-nigeria',
      name: 'The Nigerian Commercial Environment',
      order: 18,
      description:
        'Trade associations and chambers of commerce, government agencies affecting business, and the challenges Nigerian businesses face.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['business-management'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
