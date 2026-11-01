import type { SubjectSeedData } from './types'

/**
 * Islamic Religious Studies (IRK / IRS) — JAMB, WAEC and NECO.
 *
 * Organized across the four main divisions of the UTME/SSCE syllabus:
 * the Glorious Qur’an and Tafsir, Hadith and Sunnah, Tawhid and Fiqh
 * (theology and jurisprudence), and Islamic History and Moral Teachings.
 */
export const irk: SubjectSeedData = {
  slug: 'irk',
  name: 'Islamic Religious Studies',
  hue: '#2E6F5E',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Islamic Religious Studies for JAMB, WAEC and NECO: revelation and preservation of the Qur’an, Hadith literature, Tawhid, pillars of Islam and Fiqh, family law, and Islamic history and civilization.',
  topics: [
    {
      slug: 'revelation-and-preservation-of-quran',
      name: 'Revelation, Compilation and Preservation of the Qur’an',
      order: 1,
      description:
        'Modes of revelation (Wahy), piecemeal revelation, Makkan and Madinan suwar, recording under the Prophet, and compilation under Abu Bakr and Uthman.',
      estimatedMinutes: 50,
      prerequisiteSlugs: [],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'selected-suwar-and-tafsir',
      name: 'Selected Suwar, Tajwid and Tafsir',
      order: 2,
      description:
        'Rules of Tajwid, types of Tafsir, and study of selected chapters including Al-Fatihah, Ayatul-Kursi, Al-Alaq, Al-Qadr, Al-Asr, Al-Ma’un, Al-Kawthar, Al-Kafirun, and Al-Ikhlas.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['revelation-and-preservation-of-quran'],
      examWeight: 0.1,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'hadith-science-and-collections',
      name: 'Science of Hadith and the Six Sound Collections',
      order: 3,
      description:
        'Meaning of Hadith and Sunnah, structure (Isnad and Matn), classification (Sahih, Hasan, Da’if), the six authentic compilers (Sihah Sittah), and selected Hadith from An-Nawawi.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['revelation-and-preservation-of-quran'],
      examWeight: 0.1,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'tawhid-and-articles-of-faith',
      name: 'Tawhid and the Articles of Faith (Iman)',
      order: 4,
      description:
        'The concept of Tawhid (Rububiyyah, Uluhiyyah, Asma wa Sifat), forms of Shirk, and belief in Allah, His angels, books, messengers, the Last Day, and Qadar.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['selected-suwar-and-tafsir'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'taharah-and-salah',
      name: 'Taharah (Purification) and Salah (Prayer)',
      order: 5,
      description:
        'Kinds of water, Wudu, Ghusl and Tayammum; conditions, pillars and invalidators of Salah; congregational, Jumu’ah, Janazah, Eid and special prayers.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['tawhid-and-articles-of-faith'],
      examWeight: 0.1,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'zakah-sawm-and-hajj',
      name: 'Zakah, Sawm (Fasting) and Hajj (Pilgrimage)',
      order: 6,
      description:
        'Nisab, Zakatable items and beneficiaries of Zakah; rules and spiritual benefits of Ramadan fasting; and conditions, rites and types of Hajj and Umrah.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['taharah-and-salah'],
      examWeight: 0.1,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'islamic-law-shariah-and-transactions',
      name: 'Shari’ah, Schools of Fiqh and Islamic Economic System',
      order: 7,
      description:
        'Primary and secondary sources of Shari’ah (Qur’an, Sunnah, Ijma, Qiyas), the four Sunni Madhahib, Halal and Haram, prohibition of Riba, Tatfif and hoarding.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['hadith-science-and-collections', 'zakah-sawm-and-hajj'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'islamic-family-law-and-inheritance',
      name: 'Nikah (Marriage), Talaq (Divorce) and Mirath (Inheritance)',
      order: 8,
      description:
        'Conditions and rights in Nikah, prohibited degrees of marriage, kinds of Talaq and Iddah, custody of children, and Qur’anic shares of inheritance (Mirath).',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['islamic-law-shariah-and-transactions'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'islamic-morals-and-social-values',
      name: 'Islamic Moral Teachings and Social Responsibility',
      order: 9,
      description:
        'Taqwa, truthfulness, trust (Amanah), kindness to parents (Birrul-Walidayn), modesty, Jihad, human rights, and prohibition of intoxicants, gambling, adultery and backbiting.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['tawhid-and-articles-of-faith'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'jahiliyyah-and-life-of-prophet-muhammad',
      name: 'Pre-Islamic Arabia (Jahiliyyah) and the Life of Prophet Muhammad (SAW)',
      order: 10,
      description:
        'Social and religious conditions in Jahiliyyah, birth and early life of the Prophet, call to prophethood, persecution in Makkah, the Hijrah, Madinan constitution, battles (Badr, Uhud, Khandaq), Hudaybiyyah, Conquest of Makkah, and the Farewell Sermon.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['revelation-and-preservation-of-quran'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'khulafa-rashidun-and-islam-in-west-africa',
      name: 'The Rightly Guided Caliphs and Islam in West Africa',
      order: 11,
      description:
        'The caliphates of Abu Bakr, Umar, Uthman and Ali; the Umayyad and Abbasid dynasties; the spread of Islam to Kanem-Borno and Hausaland; the Sokoto Jihad of Usman dan Fodio; and Islamic scholars and organizations in Nigeria.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['jahiliyyah-and-life-of-prophet-muhammad'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
