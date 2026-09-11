export type ExamTag = 'jamb' | 'waec' | 'neco' | 'undergraduate'

export type TopicSeedData = {
  slug: string
  name: string
  /**
   * Teaching order within the subject.
   *
   * This is what makes the generated roadmap resemble a real scheme of work:
   * the planner walks topics in this order and spreads them between today and
   * the exam date, so the sequence has to match how the subject is actually
   * taught — foundations first, then what builds on them.
   */
  order: number
  description: string
  estimatedMinutes: number
  /**
   * Topics that must be studied first. The roadmap keeps a topic locked until
   * its prerequisites are done, so these encode genuine dependencies
   * (you cannot do differentiation before functions), not just ordering.
   */
  prerequisiteSlugs: string[]
  /**
   * Rough share of the paper, 0-1, used to weight revision priority.
   * Sourced from how often the topic appears across recent past papers.
   */
  examWeight: number
  examTypes: ExamTag[]
}

export type SubjectSeedData = {
  slug: string
  name: string
  examTypes: ExamTag[]
  description: string
  hue: string
  topics: TopicSeedData[]
}
