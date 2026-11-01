import type { SubjectSeedData } from './types'

/**
 * History — JAMB, WAEC and NECO.
 *
 * Covers the Nigeria Area from early centres of civilization and pre-colonial
 * states through 19th-century transformations, British conquest and colonial
 * rule, independence and post-independence Nigeria, alongside African history
 * since 1800 in chronological order.
 */
export const history: SubjectSeedData = {
  slug: 'history',
  name: 'History',
  hue: '#8A5A2E',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'History for JAMB, WAEC and NECO: early Nigerian civilizations, pre-colonial states and empires, the Sokoto Caliphate and 19th-century Yorubaland, colonial rule, decolonization, post-independence Nigeria, and modern African history.',
  topics: [
    {
      slug: 'land-peoples-early-civilizations-nigeria',
      name: 'Land, Peoples and Early Centres of Civilization in Nigeria',
      order: 1,
      description:
        'Geographical zones and how they shaped human settlement, historical sources, and early archaeological cultures: Nok, Igbo-Ukwu, Ife, Benin and Daima.',
      estimatedMinutes: 50,
      prerequisiteSlugs: [],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'pre-colonial-states-northern-nigeria',
      name: 'Pre-Colonial States of the Sudan and Sahel Belt',
      order: 2,
      description:
        'Origins, socio-political organization and economy of Kanem-Borno, the Hausa Bakwai and Banza Bakwai states, Nupe, Jukun (Kwararafa) and Igala.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['land-peoples-early-civilizations-nigeria'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'pre-colonial-states-southern-nigeria',
      name: 'Pre-Colonial Forest and Coastal States',
      order: 3,
      description:
        'Rise, administration and decline of the Old Oyo Empire and Benin Kingdom; non-centralized polities among the Igbo and Ibibio; and Niger Delta city-states (Itsekiri, Efik, Ijaw).',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['land-peoples-early-civilizations-nigeria'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'trans-saharan-and-trans-atlantic-trade',
      name: 'Trans-Saharan Trade, Trans-Atlantic Slave Trade and Legitimate Commerce',
      order: 4,
      description:
        'Trade routes, commodities and impact of Trans-Saharan trade; European coastal contact, the Trans-Atlantic slave trade, abolition, and the transition to palm oil and legitimate trade.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['pre-colonial-states-northern-nigeria', 'pre-colonial-states-southern-nigeria'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sokoto-jihad-and-19th-century-north',
      name: 'The Sokoto Jihad and 19th-Century Northern Nigeria',
      order: 5,
      description:
        'Causes, course and significance of the 1804 Jihad of Usman dan Fodio, administration of the Sokoto Caliphate, and Bornu under El-Kanemi and Rabeh.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['pre-colonial-states-northern-nigeria'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'yoruba-wars-and-christian-missions',
      name: '19th-Century Yoruba Wars and Christian Missionary Enterprise',
      order: 6,
      description:
        'Collapse of Old Oyo, the Owu, Ijaye and Kiriji/Ekitiparapo wars, rise of Ibadan, Abeokuta and New Oyo, and the impact of Christian missionaries on education and society.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['pre-colonial-states-southern-nigeria'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'british-conquest-and-resistance',
      name: 'European Imperialism, British Conquest and Nigerian Resistance',
      order: 7,
      description:
        'The Berlin Conference (1884–1885), Royal Niger Company, bombardment of Lagos, conquest of Benin, Ijebu, Aro and Sokoto, and resistance by Jaja of Opobo, Nana Olomu, Ovonramwen and Attahiru I.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['trans-saharan-and-trans-atlantic-trade', 'sokoto-jihad-and-19th-century-north', 'yoruba-wars-and-christian-missions'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'colonial-rule-and-amalgamation',
      name: 'Colonial Administration, the 1914 Amalgamation and Colonial Economy',
      order: 8,
      description:
        'Lugard and Indirect Rule in Northern, Western and Eastern Nigeria, the Aba Women’s War of 1929, the 1914 Amalgamation, railways, cash crops, banking and social development.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['british-conquest-and-resistance'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'nationalism-and-decolonization',
      name: 'Nationalism, Constitutional Development and Independence',
      order: 9,
      description:
        'Early protest movements, impact of the Second World War, nationalist press and parties (NNDP, NYM, NCNC, AG, NPC), the Clifford to Lyttleton constitutions, and attainment of independence in 1960.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['colonial-rule-and-amalgamation'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'post-independence-nigeria-civil-war-military',
      name: 'Post-Independence Nigeria, the Civil War and Military Regimes',
      order: 10,
      description:
        'Politics of the First Republic, the 1966 coups, the Nigerian Civil War (1967–1970), Gowon, Murtala/Obasanjo, the Second Republic, Buhari, Babangida, Abacha, and the 1999 return to civilian rule.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['nationalism-and-decolonization'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'west-and-north-africa-since-1800',
      name: 'Islamic Movements and Colonialism in West and North Africa',
      order: 11,
      description:
        'The jihads of Seku Ahmadu in Massina and Al-Hajj Umar Tall in Tokolor, Samori Toure’s Mandinka Empire, Sierra Leone and Liberia, Egypt under Muhammad Ali, and the Mahdist movement in Sudan.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['sokoto-jihad-and-19th-century-north'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'eastern-southern-africa-and-african-unity',
      name: 'Eastern and Southern Africa, Apartheid and International Organizations',
      order: 12,
      description:
        'Omani rule in Zanzibar, Buganda and Ethiopia under Menelik II, the Mfecane and Shaka Zulu, the Great Trek, Apartheid in South Africa, liberation movements, and Nigeria in ECOWAS, the OAU/AU, Commonwealth and UN.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['west-and-north-africa-since-1800', 'post-independence-nigeria-civil-war-military'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
