import type {
  DashboardData,
  ExamType,
  TopicStatus,
  Subject,
} from '@propella/shared';

export const mockDashboardData: DashboardData = {
  daysToExam: 64,
  examType: 'jamb' as ExamType,
  examTypes: ['jamb', 'waec'] as ExamType[],
  examDate: '2026-05-18T00:00:00.000Z',
  examReadiness: 72,
  streak: {
    currentStreak: 7,
    longestStreak: 14,
    lastActiveDate: new Date().toISOString(),
    freezesAvailable: 2,
  },
  xp: {
    totalXP: 2450,
    rankName: 'Scholar III',
    nextRankName: 'Elite Scholar',
    nextRankThreshold: 3000,
    xpToNextRank: 550,
  },
  todayTopics: [
    {
      subjectSlug: 'mathematics',
      subjectName: 'Mathematics',
      topicSlug: 'quadratic-equations',
      topicName: 'Quadratic Equations & Roots',
      estimatedMinutes: 25,
      status: 'in-progress' as TopicStatus,
      nodeStatus: 'new',
    },
    {
      subjectSlug: 'english',
      subjectName: 'Use of English',
      topicSlug: 'lexis-and-structure',
      topicName: 'Lexis & Structure: Idioms',
      estimatedMinutes: 20,
      status: 'needs-revision' as TopicStatus,
      nodeStatus: 'revision',
    },
    {
      subjectSlug: 'physics',
      subjectName: 'Physics',
      topicSlug: 'photoelectric-effect',
      topicName: 'Photoelectric Effect & Quantum Theory',
      estimatedMinutes: 30,
      status: 'in-progress' as TopicStatus,
      nodeStatus: 'quiz-due',
    },
  ],
  weakestTopics: [
    {
      subjectSlug: 'chemistry',
      subjectName: 'Chemistry',
      topicSlug: 'organic-nomenclature',
      topicName: 'IUPAC Organic Nomenclature',
      mastery: 42,
    },
    {
      subjectSlug: 'physics',
      subjectName: 'Physics',
      topicSlug: 'electromagnetic-induction',
      topicName: 'Electromagnetic Induction',
      mastery: 48,
    },
    {
      subjectSlug: 'mathematics',
      subjectName: 'Mathematics',
      topicSlug: 'calculus-integration',
      topicName: 'Integration & Area Under Curves',
      mastery: 55,
    },
  ],
  upcomingRevisions: [
    {
      subjectSlug: 'biology',
      subjectName: 'Biology',
      topicSlug: 'respiratory-systems',
      topicName: 'Cellular Respiration & Krebs Cycle',
      nextRevisionAt: 'Tomorrow, 9:00 AM',
    },
    {
      subjectSlug: 'english',
      subjectName: 'Use of English',
      topicSlug: 'vowel-contrasts',
      topicName: 'Oral English: Vowel Contrasts',
      nextRevisionAt: 'Thursday',
    },
  ],
  recentScores: [
    { date: 'Mon', averageScore: 68 },
    { date: 'Tue', averageScore: 74 },
    { date: 'Wed', averageScore: 70 },
    { date: 'Thu', averageScore: 82 },
    { date: 'Fri', averageScore: 78 },
    { date: 'Sat', averageScore: 85 },
    { date: 'Sun', averageScore: 88 },
  ],
};

export interface QuizQuestion {
  id: string;
  subjectSlug: string;
  subjectName: string;
  topicName: string;
  year?: string;
  question: string;
  options: { label: string; text: string }[];
  correctOption: string;
  explanation: string;
}

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    subjectSlug: 'physics',
    subjectName: 'Physics',
    topicName: 'Photoelectric Effect',
    year: 'JAMB 2023',
    question: 'In a photoelectric emission experiment, the threshold frequency of a metal is the minimum frequency of incident radiation required to:',
    options: [
      { label: 'A', text: 'Eject electrons from the metal surface with maximum kinetic energy' },
      { label: 'B', text: 'Just liberate electrons from the metal surface without kinetic energy' },
      { label: 'C', text: 'Ionize the gas atoms surrounding the metal' },
      { label: 'D', text: 'Increase the work function of the metal' },
    ],
    correctOption: 'B',
    explanation: 'The threshold frequency (f₀) is the minimum frequency required to overcome the work function (W₀ = hf₀) and eject electrons with zero kinetic energy.',
  },
  {
    id: 'q2',
    subjectSlug: 'mathematics',
    subjectName: 'Mathematics',
    topicName: 'Quadratic Equations',
    year: 'JAMB 2024',
    question: 'If the roots of the equation 2x² - 7x + 3 = 0 are α and β, find the value of α² + β².',
    options: [
      { label: 'A', text: '37/4' },
      { label: 'B', text: '49/4' },
      { label: 'C', text: '25/4' },
      { label: 'D', text: '31/4' },
    ],
    correctOption: 'A',
    explanation: 'Sum of roots α + β = 7/2, product αβ = 3/2. Therefore α² + β² = (α + β)² - 2αβ = (49/4) - 3 = 37/4.',
  },
  {
    id: 'q3',
    subjectSlug: 'english',
    subjectName: 'Use of English',
    topicName: 'Idioms & Concord',
    year: 'JAMB 2023',
    question: 'Neither the teacher nor the students ______ pleased with the newly rescheduled timetable.',
    options: [
      { label: 'A', text: 'was' },
      { label: 'B', text: 'were' },
      { label: 'C', text: 'is' },
      { label: 'D', text: 'are' },
    ],
    correctOption: 'B',
    explanation: 'According to the rule of proximity with "neither... nor", the verb agrees with the closer subject ("the students", which is plural past: "were").',
  },
  {
    id: 'q4',
    subjectSlug: 'chemistry',
    subjectName: 'Chemistry',
    topicName: 'Organic Chemistry',
    year: 'JAMB 2022',
    question: 'The IUPAC name for CH₃ - CH(CH₃) - CH₂ - CHO is:',
    options: [
      { label: 'A', text: '3-methylbutanal' },
      { label: 'B', text: '2-methylbutanal' },
      { label: 'C', text: '3-methylbutanone' },
      { label: 'D', text: 'iso-pentanoic acid' },
    ],
    correctOption: 'A',
    explanation: 'The longest carbon chain with the aldehyde group has 4 carbons (butanal). Numbering starts at the carbonyl carbon (C-1), putting the methyl group at C-3.',
  },
  {
    id: 'q5',
    subjectSlug: 'biology',
    subjectName: 'Biology',
    topicName: 'Cell Biology',
    year: 'JAMB 2023',
    question: 'Which of the following cellular organelles is primarily responsible for ATP synthesis during cellular respiration?',
    options: [
      { label: 'A', text: 'Ribosome' },
      { label: 'B', text: 'Golgi Apparatus' },
      { label: 'C', text: 'Mitochondrion' },
      { label: 'D', text: 'Endoplasmic Reticulum' },
    ],
    correctOption: 'C',
    explanation: 'Mitochondria are often referred to as the powerhouses of the cell because they generate most of the chemical energy needed through aerobic respiration.',
  },
];

export interface SubjectRoadmapItem {
  slug: string;
  name: string;
  topicsCount: number;
  completedCount: number;
  mastery: number;
  units: {
    id: string;
    title: string;
    status: 'completed' | 'in-progress' | 'ready' | 'locked';
    mastery: number;
    topics: {
      id: string;
      title: string;
      mastery: number;
      status: 'completed' | 'in-progress' | 'needs-revision' | 'ready';
    }[];
  }[];
}

export const mockRoadmapSubjects: SubjectRoadmapItem[] = [
  {
    slug: 'mathematics',
    name: 'Mathematics',
    topicsCount: 28,
    completedCount: 19,
    mastery: 76,
    units: [
      {
        id: 'u1',
        title: 'Unit 1: Number & Numeration',
        status: 'completed',
        mastery: 92,
        topics: [
          { id: 't1', title: 'Indices, Logarithms & Surds', mastery: 95, status: 'completed' },
          { id: 't2', title: 'Sets, Logic & Venn Diagrams', mastery: 88, status: 'completed' },
          { id: 't3', title: 'Modular Arithmetic', mastery: 92, status: 'completed' },
        ],
      },
      {
        id: 'u2',
        title: 'Unit 2: Algebra & Equations',
        status: 'in-progress',
        mastery: 70,
        topics: [
          { id: 't4', title: 'Simultaneous & Quadratic Equations', mastery: 84, status: 'completed' },
          { id: 't5', title: 'Polynomials & Remainder Theorem', mastery: 65, status: 'in-progress' },
          { id: 't6', title: 'Inequalities in One & Two Variables', mastery: 60, status: 'needs-revision' },
        ],
      },
      {
        id: 'u3',
        title: 'Unit 3: Calculus & Coordinate Geometry',
        status: 'ready',
        mastery: 52,
        topics: [
          { id: 't7', title: 'Differentiation & Stationary Points', mastery: 55, status: 'in-progress' },
          { id: 't8', title: 'Integration & Area Under Curve', mastery: 48, status: 'needs-revision' },
        ],
      },
    ],
  },
  {
    slug: 'english',
    name: 'Use of English',
    topicsCount: 24,
    completedCount: 18,
    mastery: 81,
    units: [
      {
        id: 'ue1',
        title: 'Unit 1: Comprehension & Summary',
        status: 'completed',
        mastery: 85,
        topics: [
          { id: 'et1', title: 'Passage Inferences & Tone', mastery: 88, status: 'completed' },
          { id: 'et2', title: 'Summary Techniques', mastery: 82, status: 'completed' },
        ],
      },
      {
        id: 'ue2',
        title: 'Unit 2: Lexis, Structure & Oral Forms',
        status: 'in-progress',
        mastery: 78,
        topics: [
          { id: 'et3', title: 'Synonyms & Antonyms', mastery: 90, status: 'completed' },
          { id: 'et4', title: 'Idiomatic Expressions', mastery: 72, status: 'in-progress' },
          { id: 'et5', title: 'Vowel & Consonant Sounds', mastery: 65, status: 'needs-revision' },
        ],
      },
    ],
  },
  {
    slug: 'physics',
    name: 'Physics',
    topicsCount: 26,
    completedCount: 14,
    mastery: 65,
    units: [
      {
        id: 'up1',
        title: 'Unit 1: Mechanics',
        status: 'completed',
        mastery: 80,
        topics: [
          { id: 'pt1', title: 'Scalars & Vectors', mastery: 90, status: 'completed' },
          { id: 'pt2', title: 'Equations of Motion & Projectiles', mastery: 76, status: 'completed' },
        ],
      },
      {
        id: 'up2',
        title: 'Unit 2: Waves & Optics',
        status: 'in-progress',
        mastery: 62,
        topics: [
          { id: 'pt3', title: 'Reflection & Refraction at Curved Surfaces', mastery: 70, status: 'in-progress' },
          { id: 'pt4', title: 'Sound Waves & Resonance', mastery: 54, status: 'needs-revision' },
        ],
      },
    ],
  },
  {
    slug: 'chemistry',
    name: 'Chemistry',
    topicsCount: 25,
    completedCount: 12,
    mastery: 58,
    units: [
      {
        id: 'uc1',
        title: 'Unit 1: Atomic Structure & Bonding',
        status: 'completed',
        mastery: 75,
        topics: [
          { id: 'ct1', title: 'Periodic Table Trends', mastery: 80, status: 'completed' },
          { id: 'ct2', title: 'Chemical Bonding & Hybridization', mastery: 70, status: 'completed' },
        ],
      },
      {
        id: 'uc2',
        title: 'Unit 2: Organic Chemistry',
        status: 'in-progress',
        mastery: 45,
        topics: [
          { id: 'ct3', title: 'Hydrocarbons: Alkanes, Alkenes, Alkynes', mastery: 60, status: 'in-progress' },
          { id: 'ct4', title: 'Alkanols, Alkanoic Acids & Esters', mastery: 42, status: 'needs-revision' },
        ],
      },
    ],
  },
];

export interface StudyNote {
  id: string;
  subjectSlug: string;
  subjectName: string;
  topicTitle: string;
  summary: string;
  keyPoints: string[];
  formulas?: string[];
  examTips: string;
  bookmarked: boolean;
}

export const mockStudyNotes: StudyNote[] = [
  {
    id: 'n1',
    subjectSlug: 'mathematics',
    subjectName: 'Mathematics',
    topicTitle: 'Quadratic Equations & Roots',
    summary: 'A second-degree polynomial equation with standard form ax² + bx + c = 0.',
    keyPoints: [
      'Discriminant Δ = b² - 4ac determines nature of roots',
      'Δ > 0: Two real distinct roots',
      'Δ = 0: Two real equal roots',
      'Δ < 0: Complex conjugate roots',
    ],
    formulas: [
      'x = (-b ± √(b² - 4ac)) / (2a)',
      'Sum of roots (α + β) = -b/a',
      'Product of roots (αβ) = c/a',
    ],
    examTips: 'JAMB frequently asks for expressions like 1/α + 1/β = (α + β)/(αβ) or α² + β² = (α+β)² - 2αβ.',
    bookmarked: true,
  },
  {
    id: 'n2',
    subjectSlug: 'physics',
    subjectName: 'Physics',
    topicTitle: 'Photoelectric Effect',
    summary: 'The emission of electrons when electromagnetic radiation impinges on a material surface.',
    keyPoints: [
      'Discovered by Hertz, explained by Einstein in 1905 using photon quanta',
      'Kinetic energy of ejected electrons depends strictly on radiation frequency, NOT intensity',
      'Emission is instantaneous (no time lag)',
    ],
    formulas: [
      'E = hf',
      'hf = W₀ + KE_max',
      'W₀ = hf₀ (Work Function)',
      'KE_max = eV_s (Stopping Potential)',
    ],
    examTips: 'Remember that increasing light intensity increases the photocurrent (number of electrons), but leaves maximum kinetic energy unchanged.',
    bookmarked: true,
  },
  {
    id: 'n3',
    subjectSlug: 'english',
    subjectName: 'Use of English',
    topicTitle: 'Concord & Proximity Rules',
    summary: 'Rules governing grammatical agreement between subject and verb in English sentences.',
    keyPoints: [
      'Subject-verb agreement: Singular subjects take singular verbs',
      'Correlative conjunctions ("either...or", "neither...nor"): Verb agrees with the subject closest to it',
      'Expressions like "as well as", "together with", "accompanied by" do not affect the original subject number',
    ],
    examTips: 'Watch out for sentences with intervening prepositional phrases ("The box of oranges is heavy", not "are heavy").',
    bookmarked: false,
  },
  {
    id: 'n4',
    subjectSlug: 'chemistry',
    subjectName: 'Chemistry',
    topicTitle: 'Electrochemical Cells & Faradays Laws',
    summary: 'Quantitative relationships between electrical charge and chemical transformation.',
    keyPoints: [
      '1 Faraday = 96,500 Coulombs (charge on 1 mole of electrons)',
      'Anode is where oxidation happens; Cathode is where reduction happens (AN OX, RED CAT)',
    ],
    formulas: [
      'Q = I × t',
      'm = (M × I × t) / (n × F)',
    ],
    examTips: 'Always convert time to seconds before calculating charge Q.',
    bookmarked: false,
  },
];

export interface LeaderboardUser {
  rank: number;
  name: string;
  school?: string;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
  avatar: string;
}

export const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: 'Chinedu Okafor', school: 'King\'s College Lagos', xp: 4820, streak: 21, isCurrentUser: false, avatar: '👨🏾‍🎓' },
  { rank: 2, name: 'Amina Bello', school: 'Federal Govt Academy Suleja', xp: 4350, streak: 18, isCurrentUser: false, avatar: '👩🏾‍🎓' },
  { rank: 3, name: 'Tunde Adebayo', school: 'Loyola Jesuit College', xp: 3910, streak: 15, isCurrentUser: false, avatar: '👨🏾‍🏫' },
  { rank: 4, name: 'You (Alex)', school: 'Preparing for JAMB 2026', xp: 2450, streak: 7, isCurrentUser: true, avatar: '⚡' },
  { rank: 5, name: 'Ngozi Eze', school: 'Queen\'s College Lagos', xp: 2320, streak: 6, isCurrentUser: false, avatar: '👩🏾‍🎓' },
  { rank: 6, name: 'Ibrahim Danladi', school: 'Barewa College', xp: 2190, streak: 9, isCurrentUser: false, avatar: '👨🏾‍🎓' },
  { rank: 7, name: 'Blessing Udoh', school: 'Air Force Comprehensive', xp: 1980, streak: 4, isCurrentUser: false, avatar: '👩🏾‍🎓' },
];

export interface StudyPlanDay {
  day: string;
  date: string;
  isToday: boolean;
  tasks: {
    id: string;
    subject: string;
    title: string;
    time: string;
    duration: string;
    done: boolean;
  }[];
}

export const mockPlannerDays: StudyPlanDay[] = [
  {
    day: 'Today',
    date: 'Mon, Oct 13',
    isToday: true,
    tasks: [
      { id: 'pt1', subject: 'Mathematics', title: 'Quadratic Equations past questions drill', time: '08:00 AM', duration: '30m', done: true },
      { id: 'pt2', subject: 'Physics', title: 'Review Photoelectric Effect formulas & quiz', time: '02:30 PM', duration: '25m', done: false },
      { id: 'pt3', subject: 'Use of English', title: 'Idioms & Concord test session', time: '07:00 PM', duration: '20m', done: false },
    ],
  },
  {
    day: 'Tomorrow',
    date: 'Tue, Oct 14',
    isToday: false,
    tasks: [
      { id: 'pt4', subject: 'Chemistry', title: 'IUPAC Organic Nomenclature mastery drill', time: '09:00 AM', duration: '35m', done: false },
      { id: 'pt5', subject: 'Biology', title: 'Cellular Respiration revision test', time: '04:00 PM', duration: '25m', done: false },
    ],
  },
  {
    day: 'Wednesday',
    date: 'Wed, Oct 15',
    isToday: false,
    tasks: [
      { id: 'pt6', subject: 'Mocks', title: 'Mini JAMB 60-question timed simulation', time: '10:00 AM', duration: '60m', done: false },
    ],
  },
];
