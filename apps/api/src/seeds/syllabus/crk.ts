import type { SubjectSeedData } from './types'

/**
 * Christian Religious Knowledge (CRK) — JAMB, WAEC and NECO.
 *
 * Follows the canonical biblical narrative from Creation and the Patriarchs
 * through the Monarchy, Prophets, the Synoptic Gospels and John, the Early
 * Church in Acts, and the Epistles on Christian living.
 */
export const crk: SubjectSeedData = {
  slug: 'crk',
  name: 'Christian Religious Knowledge',
  hue: '#6B4E8A',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Christian Religious Knowledge for JAMB, WAEC and NECO: Old Testament themes from Creation to the Prophets, the life and ministry of Jesus in the Gospels, the Early Church in Acts, and Christian living in the Epistles.',
  topics: [
    {
      slug: 'sovereignty-of-god-creation',
      name: 'The Sovereignty of God and Creation',
      order: 1,
      description:
        'God as Creator and Controller of the universe in Genesis 1–2, Amos and Isaiah, and human responsibility over creation.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'covenant-patriarchs',
      name: 'The Covenant with the Patriarchs',
      order: 2,
      description:
        'God’s covenants with Noah, Abraham and Israel, the call of Abraham, and the themes of faith and obedience.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['sovereignty-of-god-creation'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'leadership-moses-joshua-judges',
      name: 'Leadership in Israel: Joseph, Moses, Joshua and the Judges',
      order: 3,
      description:
        'Joseph in Egypt, the call of Moses and the Exodus, Joshua’s leadership, and Deborah, Gideon and Samson as Judges.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['covenant-patriarchs'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'parental-responsibility-eli-samuel',
      name: 'Parental Responsibility: Eli, Samuel and Asa',
      order: 4,
      description:
        'The failure of Eli and Samuel’s sons, consequences of poor parenting, and the reforms of King Asa and Jehoshaphat.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['leadership-moses-joshua-judges'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'monarchy-in-israel',
      name: 'The Monarchy in Israel: Saul, David and Solomon',
      order: 5,
      description:
        'Saul’s anointing and disobedience, David’s rise, repentance and leadership, Solomon’s wisdom and downfall, and the division of the kingdom.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['parental-responsibility-eli-samuel'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'greed-and-supremacy-of-god',
      name: 'Greed, Gehazi, Ahab and the Supremacy of God',
      order: 6,
      description:
        'Ahab and Naboth’s vineyard, Naaman and Gehazi’s greed, Elijah on Mount Carmel, and the three Hebrew youths in Babylon.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['monarchy-in-israel'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'religious-reforms-and-exile',
      name: 'Religious Reforms, Exile and Restoration',
      order: 7,
      description:
        'King Josiah’s religious reforms, the fall of Judah, Daniel in exile, and the rebuilding under Ezra and Nehemiah.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['greed-and-supremacy-of-god'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'prophets-social-justice-true-religion',
      name: 'The Prophets: Social Justice, True Religion and Divine Love',
      order: 8,
      description:
        'The call of Isaiah, Jeremiah and Ezekiel; Amos on social justice and true religion; Hosea on God’s Steadfast love; and Jonah’s mission to Nineveh.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['religious-reforms-and-exile'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'birth-baptism-temptation-of-jesus',
      name: 'Birth, Baptism and Temptation of Jesus',
      order: 9,
      description:
        'The infancy narratives, the ministry of John the Baptist, the baptism of Jesus, and the three temptations in the wilderness.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['prophets-social-justice-true-religion'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'discipleship-and-miracles-of-jesus',
      name: 'Discipleship and the Miracles of Jesus',
      order: 10,
      description:
        'The call of the first disciples, demands of discipleship, and the nature, healing and exorcism miracles of Jesus.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['birth-baptism-temptation-of-jesus'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'parables-and-teachings-of-jesus',
      name: 'The Parables and Sermon on the Mount',
      order: 11,
      description:
        'The Beatitudes, Sermon on the Mount, parables of the Kingdom, parables on God’s love, forgiveness, wealth and prayer, and the I AM sayings in John.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['discipleship-and-miracles-of-jesus'],
      examWeight: 0.09,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'passion-death-resurrection-ascension',
      name: 'The Passion, Death, Resurrection and Ascension of Jesus',
      order: 12,
      description:
        'The Triumphal Entry, Last Supper, Gethsemane, trials before the Sanhedrin, Pilate and Herod, crucifixion, resurrection appearances, and the Great Commission.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['parables-and-teachings-of-jesus'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'early-church-and-missionary-journeys',
      name: 'The Early Church and Paul’s Missionary Journeys',
      order: 13,
      description:
        'Pentecost, communal life in the early church, selection of the seven deacons, Stephen, Philip, Peter’s ministry, Saul’s conversion, and the Council of Jerusalem.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['passion-death-resurrection-ascension'],
      examWeight: 0.08,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'christian-living-in-the-epistles',
      name: 'Christian Living and Teachings in the Epistles',
      order: 14,
      description:
        'Justification by faith, spiritual gifts, love, humility, civic responsibility, dignity of labour, impartial faith and works, the Second Coming, and Christian persecution.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['early-church-and-missionary-journeys'],
      examWeight: 0.07,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
