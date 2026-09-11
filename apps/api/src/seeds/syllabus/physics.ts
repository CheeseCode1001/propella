import type { SubjectSeedData } from './types'

/**
 * Physics — JAMB/UTME, WAEC and NECO.
 *
 * Follows the syllabus order: measurement, then mechanics, then the property
 * topics (heat, waves), then electricity and magnetism, and modern physics
 * last. Mechanics is the foundation almost everything else leans on, which the
 * prerequisites reflect.
 */
export const physics: SubjectSeedData = {
  slug: 'physics',
  name: 'Physics',
  hue: '#2F6B6B',
  examTypes: ['jamb', 'waec', 'neco'],
  description:
    'Physics for JAMB, WAEC and NECO: measurement, mechanics, heat, waves and sound, light, electricity and magnetism, and modern physics.',
  topics: [
    // ── Measurement ──────────────────────────────────────────────────────
    {
      slug: 'measurement-units',
      name: 'Measurement and Units',
      order: 1,
      description:
        'Fundamental and derived quantities, SI units, dimensions, and using dimensional analysis to check an equation.',
      estimatedMinutes: 45,
      prerequisiteSlugs: [],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'scalars-vectors',
      name: 'Scalars and Vectors',
      order: 2,
      description:
        'Distinguishing scalars from vectors, resolving a vector into components, and adding vectors by the parallelogram law.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['measurement-units'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Mechanics ────────────────────────────────────────────────────────
    {
      slug: 'motion-linear',
      name: 'Linear Motion',
      order: 3,
      description:
        'Distance, displacement, speed, velocity and acceleration; the equations of uniformly accelerated motion; and motion graphs.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['scalars-vectors'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'projectile-motion',
      name: 'Projectile Motion',
      order: 4,
      description:
        'Horizontal and oblique projection, time of flight, maximum height and range, and why the horizontal velocity stays constant.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['motion-linear'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'newtons-laws',
      name: "Newton's Laws of Motion",
      order: 5,
      description:
        'The three laws, inertia, momentum and impulse, and conservation of linear momentum in collisions.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['motion-linear'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'equilibrium-forces',
      name: 'Equilibrium of Forces',
      order: 6,
      description:
        'Moments, the principle of moments, centre of gravity, and the conditions for a body to be in equilibrium.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['scalars-vectors'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'work-energy-power',
      name: 'Work, Energy and Power',
      order: 7,
      description:
        'Work done by a force, kinetic and potential energy, conservation of energy, power, and efficiency.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['newtons-laws'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'machines',
      name: 'Simple Machines',
      order: 8,
      description:
        'Levers, pulleys, inclined planes, screws and wheel-and-axle; mechanical advantage, velocity ratio and efficiency.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['work-energy-power'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'circular-motion-gravitation',
      name: 'Circular Motion and Gravitation',
      order: 9,
      description:
        'Angular velocity, centripetal force, Newton\'s law of universal gravitation, escape velocity and satellites.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['newtons-laws'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'simple-harmonic-motion',
      name: 'Simple Harmonic Motion',
      order: 10,
      description:
        'Conditions for SHM, period and frequency, the simple pendulum and spring-mass system, energy in SHM, and resonance.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['circular-motion-gravitation'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'elasticity',
      name: 'Elasticity',
      order: 11,
      description:
        "Hooke's law, elastic limit, Young's modulus, and energy stored in a stretched wire.",
      estimatedMinutes: 45,
      prerequisiteSlugs: ['work-energy-power'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'fluids-pressure',
      name: 'Fluids at Rest',
      order: 12,
      description:
        "Pressure in liquids, atmospheric pressure, Pascal's principle, Archimedes' principle, flotation and the hydrometer.",
      estimatedMinutes: 55,
      prerequisiteSlugs: ['equilibrium-forces'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'surface-tension-viscosity',
      name: 'Surface Tension, Capillarity and Viscosity',
      order: 13,
      description:
        'Molecular explanation of surface tension, capillary rise, viscosity, and terminal velocity in a fluid.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['fluids-pressure'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Heat ─────────────────────────────────────────────────────────────
    {
      slug: 'temperature-thermometry',
      name: 'Temperature and Thermometry',
      order: 14,
      description:
        'Temperature scales and conversion, thermometric properties, and the common types of thermometer.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['measurement-units'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'thermal-expansion',
      name: 'Thermal Expansion',
      order: 15,
      description:
        'Linear, area and volume expansivity, the anomalous expansion of water, and why expansion gaps exist in bridges and rails.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['temperature-thermometry'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'heat-quantity',
      name: 'Quantity of Heat',
      order: 16,
      description:
        'Heat capacity, specific heat capacity, latent heat of fusion and vaporisation, and calorimetry calculations.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['temperature-thermometry'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'gas-laws',
      name: 'Gas Laws',
      order: 17,
      description:
        "Boyle's, Charles's and the pressure law; the general gas equation; and the kinetic theory of gases.",
      estimatedMinutes: 55,
      prerequisiteSlugs: ['heat-quantity'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'heat-transfer',
      name: 'Heat Transfer',
      order: 18,
      description:
        'Conduction, convection and radiation; thermal conductivity; and everyday applications such as the vacuum flask.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['heat-quantity'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'vapours-humidity',
      name: 'Vapours and Humidity',
      order: 19,
      description:
        'Saturated and unsaturated vapours, evaporation and boiling, dew point, and relative humidity.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['gas-laws'],
      examWeight: 0.03,
      examTypes: ['waec', 'neco'],
    },

    // ── Waves, sound and light ───────────────────────────────────────────
    {
      slug: 'wave-motion',
      name: 'Wave Motion',
      order: 20,
      description:
        'Transverse and longitudinal waves, wavelength, frequency, speed and amplitude, and the wave equation v = fλ.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['simple-harmonic-motion'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'sound-waves',
      name: 'Sound Waves',
      order: 21,
      description:
        'Production and propagation of sound, speed of sound, echoes, resonance in pipes and strings, and the Doppler effect.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['wave-motion'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'light-reflection',
      name: 'Reflection of Light',
      order: 22,
      description:
        'Laws of reflection, images in plane mirrors, and image formation by concave and convex mirrors with the mirror formula.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['wave-motion'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'light-refraction',
      name: 'Refraction of Light',
      order: 23,
      description:
        "Snell's law, refractive index, real and apparent depth, total internal reflection, and refraction through prisms and lenses.",
      estimatedMinutes: 60,
      prerequisiteSlugs: ['light-reflection'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'optical-instruments',
      name: 'Optical Instruments',
      order: 24,
      description:
        'The human eye and its defects, the camera, microscope and telescope, and magnifying power.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['light-refraction'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'electromagnetic-spectrum',
      name: 'Electromagnetic Spectrum',
      order: 25,
      description:
        'The regions of the spectrum in order, their properties, and their uses and hazards.',
      estimatedMinutes: 40,
      prerequisiteSlugs: ['wave-motion'],
      examWeight: 0.03,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Electricity and magnetism ────────────────────────────────────────
    {
      slug: 'electrostatics',
      name: 'Electrostatics',
      order: 26,
      description:
        "Charging by friction, induction and contact; Coulomb's law; electric field and potential; and the lightning conductor.",
      estimatedMinutes: 55,
      prerequisiteSlugs: ['work-energy-power'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'capacitors',
      name: 'Capacitors',
      order: 27,
      description:
        'Capacitance, capacitors in series and parallel, energy stored, and the effect of a dielectric.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['electrostatics'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'current-electricity',
      name: 'Current Electricity',
      order: 28,
      description:
        "Ohm's law, resistance and resistivity, resistors in series and parallel, and Kirchhoff's laws.",
      estimatedMinutes: 65,
      prerequisiteSlugs: ['electrostatics'],
      examWeight: 0.06,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'electrical-energy-power',
      name: 'Electrical Energy and Power',
      order: 29,
      description:
        'Electrical work and power, heating effect of current, the kilowatt-hour, and reading an electricity bill.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['current-electricity'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'magnetism',
      name: 'Magnets and Magnetic Fields',
      order: 30,
      description:
        'Properties of magnets, magnetic field patterns, the earth\'s magnetic field, and magnetisation and demagnetisation.',
      estimatedMinutes: 45,
      prerequisiteSlugs: ['current-electricity'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'electromagnetic-field',
      name: 'Magnetic Effect of a Current',
      order: 31,
      description:
        'Field around a current-carrying conductor, the force on a conductor in a field, and the motor and moving-coil galvanometer.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['magnetism'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'electromagnetic-induction',
      name: 'Electromagnetic Induction',
      order: 32,
      description:
        "Faraday's and Lenz's laws, self and mutual induction, the a.c. generator, and the transformer.",
      estimatedMinutes: 55,
      prerequisiteSlugs: ['electromagnetic-field'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'alternating-current',
      name: 'Alternating Current Circuits',
      order: 33,
      description:
        'Peak and r.m.s. values, reactance and impedance, the LCR series circuit, and resonance.',
      estimatedMinutes: 55,
      prerequisiteSlugs: ['electromagnetic-induction'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },

    // ── Modern physics ───────────────────────────────────────────────────
    {
      slug: 'electronics-conduction',
      name: 'Conduction Through Materials and Electronics',
      order: 34,
      description:
        'Conductors, semiconductors and insulators; intrinsic and extrinsic semiconductors; and the p-n junction diode and transistor.',
      estimatedMinutes: 50,
      prerequisiteSlugs: ['current-electricity'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'atomic-structure-physics',
      name: 'Structure of the Atom',
      order: 35,
      description:
        "Thomson, Rutherford and Bohr models, energy levels and line spectra, and Millikan's oil-drop experiment.",
      estimatedMinutes: 50,
      prerequisiteSlugs: ['electrostatics'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'photoelectric-effect',
      name: 'Photoelectric Effect',
      order: 36,
      description:
        "Einstein's photoelectric equation, threshold frequency and work function, and why the effect needs a particle model of light.",
      estimatedMinutes: 50,
      prerequisiteSlugs: ['atomic-structure-physics'],
      examWeight: 0.04,
      examTypes: ['jamb', 'waec', 'neco'],
    },
    {
      slug: 'radioactivity',
      name: 'Radioactivity and Nuclear Energy',
      order: 37,
      description:
        'Alpha, beta and gamma radiation, half-life calculations, nuclear fission and fusion, and radiation hazards and uses.',
      estimatedMinutes: 60,
      prerequisiteSlugs: ['atomic-structure-physics'],
      examWeight: 0.05,
      examTypes: ['jamb', 'waec', 'neco'],
    },
  ],
}
