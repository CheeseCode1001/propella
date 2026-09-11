import type { SubjectSeedData } from './types'

/**
 * General Mathematics — JAMB/UTME, WAEC and NECO.
 *
 * Ordered the way the syllabus is actually taught: number work first, then
 * algebra, then the geometry and trigonometry that lean on it, then calculus
 * and statistics last. Prerequisites encode real dependencies — indices before
 * logarithms, functions before differentiation — so the roadmap never puts a
 * topic in front of a student who has not met what it assumes.
 *
 * Weights approximate how heavily each area appears on the 40-question UTME
 * paper: Number and Numeration ~15%, Algebra ~25%, Geometry/Trig ~25%,
 * Calculus ~15%, Statistics ~20%.
 */
export const mathematics: SubjectSeedData = {
  slug: 'mathematics',
  name: 'Mathematics',
  hue: '#6B4E8F',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'General Mathematics for JAMB, WAEC and NECO: number and numeration, algebra, geometry and trigonometry, introductory calculus, and statistics.',
  topics: [
    // ── Number and numeration ────────────────────────────────────────────
    {
      slug: 'number-bases',
      name: 'Number Bases',
      order: 1,
      description:
        'Converting between base ten and other bases, and adding, subtracting and multiplying in a given base. A reliable two-mark opener on most UTME papers.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'fractions-decimals-approximation',
      name: 'Fractions, Decimals and Approximation',
      order: 2,
      description:
        'Operations on fractions and decimals, significant figures, decimal places, and rounding. Underpins almost every calculation question on the paper.',
      estimatedMinutes: 50,
      prerequisiteSlugs: [],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'indices',
      name: 'Indices',
      order: 3,
      description:
        'Laws of indices, negative and fractional powers, and solving equations where the unknown sits in the exponent.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['fractions-decimals-approximation'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'logarithms',
      name: 'Logarithms',
      order: 4,
      description:
        'Logarithms as the inverse of indices, the laws of logarithms, change of base, and using log tables or a calculator.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['indices'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'surds',
      name: 'Surds',
      order: 5,
      description:
        'Simplifying surds, operations on surds, and rationalising denominators including the conjugate method.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['indices'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sets',
      name: 'Sets',
      order: 6,
      description:
        'Set notation, union, intersection and complement, and solving two- and three-set Venn diagram problems.',
      estimatedMinutes: 50,
      prerequisiteSlugs: [],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'ratio-proportion-rates',
      name: 'Ratio, Proportion and Rates',
      order: 7,
      description:
        'Sharing in a ratio, direct and inverse proportion, rates, and the speed-distance-time relationship.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['fractions-decimals-approximation'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'percentages-commercial-arithmetic',
      name: 'Percentages and Commercial Arithmetic',
      order: 8,
      description:
        'Profit and loss, discount, commission, simple and compound interest, depreciation, hire purchase, VAT and income tax — set in naira.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['ratio-proportion-rates'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'modular-arithmetic',
      name: 'Modular Arithmetic',
      order: 9,
      description:
        'Arithmetic in a given modulus, and reading the addition and multiplication tables that UTME questions are built on.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['number-bases'],
      examWeight: 0.02,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Algebra ──────────────────────────────────────────────────────────
    {
      slug: 'algebraic-expressions',
      name: 'Algebraic Expressions',
      order: 10,
      description:
        'Expansion, factorisation, algebraic fractions, and the difference of two squares. The toolkit every later algebra topic assumes.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['indices'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'linear-equations-inequalities',
      name: 'Linear Equations and Inequalities',
      order: 11,
      description:
        'Solving linear equations, simultaneous equations by substitution and elimination, and linear inequalities on a number line.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['algebraic-expressions'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'quadratic-equations',
      name: 'Quadratic Equations',
      order: 12,
      description:
        'Solving by factorisation, completing the square and formula; the discriminant; and forming an equation from given roots.',
      estimatedMinutes: 65,
      prerequisiteSlugs: ['algebraic-expressions'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'variation',
      name: 'Variation',
      order: 13,
      description:
        'Direct, inverse, joint and partial variation, and finding the constant of variation from given values.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['ratio-proportion-rates'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sequences-series',
      name: 'Sequences and Series',
      order: 14,
      description:
        'Arithmetic and geometric progressions, nth term, sum of n terms, and the sum to infinity of a convergent GP.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['algebraic-expressions'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'matrices-determinants',
      name: 'Matrices and Determinants',
      order: 15,
      description:
        'Addition and multiplication of matrices, determinant and inverse of a 2×2 matrix, and solving simultaneous equations with matrices.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['linear-equations-inequalities'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'polynomials-remainder-theorem',
      name: 'Polynomials and the Remainder Theorem',
      order: 16,
      description:
        'Operations on polynomials, factor and remainder theorems, and factorising a cubic to solve it.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['quadratic-equations'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'logical-reasoning',
      name: 'Logical Reasoning',
      order: 17,
      description:
        'Simple and compound statements, negation, implication and the converse, and truth tables.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['sets'],
      examWeight: 0.02,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Geometry and trigonometry ────────────────────────────────────────
    {
      slug: 'plane-geometry-angles',
      name: 'Angles and Straight Lines',
      order: 18,
      description:
        'Angles at a point and on a line, parallel lines with a transversal, and angle properties of triangles and polygons.',
      estimatedMinutes: 50,
      prerequisiteSlugs: [],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'triangles-polygons',
      name: 'Triangles and Polygons',
      order: 19,
      description:
        'Congruence and similarity, properties of quadrilaterals, and interior and exterior angles of regular polygons.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['plane-geometry-angles'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'circle-geometry',
      name: 'Circle Geometry',
      order: 20,
      description:
        'Circle theorems: angle at the centre, angles in the same segment, cyclic quadrilaterals, and the tangent-radius property.',
      estimatedMinutes: 65,
      prerequisiteSlugs: ['triangles-polygons'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'mensuration-plane',
      name: 'Mensuration: Perimeter and Area',
      order: 21,
      description:
        'Perimeter and area of plane shapes, sectors and segments of a circle, and compound figures.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['triangles-polygons'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'mensuration-solids',
      name: 'Mensuration: Volume and Surface Area',
      order: 22,
      description:
        'Volume and surface area of prisms, cylinders, cones, pyramids and spheres, including frustums.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['mensuration-plane'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'pythagoras-theorem',
      name: 'Pythagoras Theorem',
      order: 23,
      description:
        'Finding a missing side in a right-angled triangle, and applying the theorem to heights, distances and diagonals.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['triangles-polygons'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'trigonometric-ratios',
      name: 'Trigonometric Ratios',
      order: 24,
      description:
        'Sine, cosine and tangent in a right-angled triangle, the special angles 30°, 45° and 60°, and angles of elevation and depression.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['pythagoras-theorem'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sine-cosine-rules',
      name: 'Sine and Cosine Rules',
      order: 25,
      description:
        'Solving non-right-angled triangles, the area formula ½ab sin C, and bearings problems that combine both rules.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['trigonometric-ratios'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'trigonometric-graphs',
      name: 'Trigonometric Graphs and Identities',
      order: 26,
      description:
        'Graphs of sine, cosine and tangent, amplitude and period, and the identity sin²θ + cos²θ = 1.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['trigonometric-ratios'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'coordinate-geometry',
      name: 'Coordinate Geometry',
      order: 27,
      description:
        'Distance and midpoint, gradient, equation of a straight line, and the condition for two lines to be parallel or perpendicular.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['linear-equations-inequalities'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'geometric-construction',
      name: 'Geometric Construction and Loci',
      order: 28,
      description:
        'Constructing angles, bisectors and triangles with ruler and compasses, and the common loci.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['plane-geometry-angles'],
      examWeight: 0.02,
      examTypes: ['waec', 'neco'],
    },
    {
      slug: 'earth-geometry',
      name: 'Longitude and Latitude',
      order: 29,
      description:
        'Great and small circles, distance along a meridian and a parallel of latitude, and the associated time differences.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['mensuration-solids', 'trigonometric-ratios'],
      examWeight: 0.02,
      examTypes: ['waec', 'neco'],
    },

    // ── Calculus ─────────────────────────────────────────────────────────
    {
      slug: 'functions-relations',
      name: 'Functions and Relations',
      order: 30,
      description:
        'Domain and range, types of mapping, composite and inverse functions, and evaluating a function at a value.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['algebraic-expressions'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'differentiation',
      name: 'Differentiation',
      order: 31,
      description:
        'Differentiating polynomials from first principles and by rule, the product, quotient and chain rules, and rates of change.',
      estimatedMinutes: 70,
      prerequisiteSlugs: ['functions-relations'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'applications-of-differentiation',
      name: 'Applications of Differentiation',
      order: 32,
      description:
        'Gradient of a curve, equations of tangents and normals, maximum and minimum points, and simple optimisation.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['differentiation'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'integration',
      name: 'Integration',
      order: 33,
      description:
        'Integration as the reverse of differentiation, indefinite and definite integrals, and area under a curve.',
      estimatedMinutes: 65,
      prerequisiteSlugs: ['differentiation'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Statistics and probability ───────────────────────────────────────
    {
      slug: 'data-presentation',
      name: 'Data Presentation',
      order: 34,
      description:
        'Frequency tables, bar charts, pie charts, histograms and cumulative frequency curves — and reading values off them.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['fractions-decimals-approximation'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'measures-of-central-tendency',
      name: 'Mean, Median and Mode',
      order: 35,
      description:
        'Averages for ungrouped and grouped data, the assumed mean method, and choosing the right average for a distribution.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['data-presentation'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'measures-of-dispersion',
      name: 'Range, Variance and Standard Deviation',
      order: 36,
      description:
        'Range, mean deviation, variance and standard deviation, and what spread tells you that an average cannot.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['measures-of-central-tendency'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'permutations-combinations',
      name: 'Permutations and Combinations',
      order: 37,
      description:
        'Counting arrangements and selections, nPr and nCr, and deciding which one a question is asking for.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['sets'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'probability',
      name: 'Probability',
      order: 38,
      description:
        'Probability of single and combined events, mutually exclusive and independent events, and probability from a table or tree diagram.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['permutations-combinations'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
