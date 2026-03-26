// ============================================================
// PHYSICAL CONSTANTS (CGS)
// ============================================================
const G_N = 6.674e-8;
const c_light = 2.998e10;
const hbar_cgs = 1.055e-27;
const kB_cgs = 1.381e-16;
const M_sun = 1.989e33;
const Mpc_cm = 3.086e24;
const GeV_g = 1.783e-24;
const eV_g = 1.783e-33;

const m_planck = Math.sqrt(hbar_cgs * c_light / G_N);
const l_planck = Math.sqrt(hbar_cgs * G_N / (c_light**3));

const log10 = Math.log10;

// Schwarzschild: r_s = 2Gm/c^2  =>  logR = logM + log(2G/c^2)
const BH_const = log10(2 * G_N / (c_light * c_light)); // ~ -28.07

// Compton: lambda_c = hbar/(mc) => logR = -logM + log(hbar/c)
const C_const = log10(hbar_cgs / c_light); // ~ -37.52

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function comptonR(m_g) { return log10(hbar_cgs / (m_g * c_light)); }
function schwarzR(m_g) { return log10(2 * G_N * m_g / (c_light * c_light)); }

function toSuperscript(n) {
  const sup = {'-':'\u207B','0':'\u2070','1':'\u00B9','2':'\u00B2','3':'\u00B3','4':'\u2074','5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079'};
  return String(n).split('').map(c => sup[c] || c).join('');
}

// ============================================================
// OBJECT DATA
// ============================================================
const objects = [
  // Fundamental particles (Compton line)
  {name:"Neutrinos (\u03BD)", logR: comptonR(0.05 * eV_g), logM: log10(0.05 * eV_g), cat:"particle",
   desc:"Neutrinos are nearly massless fundamental leptons interacting only via the weak force and gravity. Three flavors exist (electron, muon, tau). Their tiny mass (~0.05 eV) gives them an enormous Compton wavelength. Neutrinos decoupled from the photon plasma about 1 second after the Big Bang."},
  {name:"Electron (e)", logR: comptonR(9.109e-28), logM: log10(9.109e-28), cat:"particle",
   desc:"The electron (mass 0.511 MeV/c\u00B2) is the lightest charged particle and fundamental building block of all atoms. Electron degeneracy pressure supports white dwarf stars against gravitational collapse up to the Chandrasekhar limit of ~1.4 M\u2609."},
  {name:"Proton (p)", logR: comptonR(1.673e-24), logM: log10(1.673e-24), cat:"particle",
   desc:"The proton is a composite baryon (uud quarks) with mass 938 MeV/c\u00B2. Protons condensed from the quark-gluon plasma ~10\u207B\u2076 s after the Big Bang during the QCD phase transition. Protons are extraordinarily stable (lifetime > 10\u00B3\u2074 years) and constitute the nuclei of hydrogen atoms."},
  {name:"Neutron (n)", logR: comptonR(1.675e-24), logM: log10(1.675e-24), cat:"particle",
   desc:"The neutron (udd quarks) is slightly heavier than the proton. Free neutrons undergo beta decay with a half-life of ~10 minutes. Bound in nuclei, they are stable. Neutron degeneracy pressure supports neutron stars against gravitational collapse."},
  {name:"W\u00B1", logR: comptonR(80.4 * GeV_g), logM: log10(80.4 * GeV_g), cat:"particle",
   desc:"The W boson (80.4 GeV/c\u00B2) mediates the charged weak interaction. Discovered at CERN in 1983 by Carlo Rubbia and Simon van der Meer. It is responsible for beta decay and neutrino interactions."},
  {name:"Higgs (H\u2070)", logR: comptonR(125 * GeV_g), logM: log10(125 * GeV_g), cat:"particle",
   desc:"The Higgs boson (125 GeV/c\u00B2) is the quantum excitation of the Higgs field. It gives mass to fundamental particles via the Higgs mechanism. Discovered at CERN's LHC in 2012, confirming the Standard Model."},
  {name:"Top quark (t)", logR: comptonR(173 * GeV_g), logM: log10(173 * GeV_g), cat:"particle",
   desc:"The top quark is the heaviest known fundamental particle at 173 GeV/c\u00B2. It has the smallest Compton wavelength of any known particle and decays in ~5\u00D710\u207B\u00B2\u2075 s \u2014 before hadronization can occur."},

  // Atoms
  {name:"Atoms", logR: -8, logM: log10(1.67e-24 * 16), cat:"atomic",
   desc:"Atoms have radii ~10\u207B\u2078 cm (~1 \u00C5ngstr\u00F6m). They consist of a nucleus (protons and neutrons) surrounded by electron clouds. Atoms first formed during recombination ~380,000 years after the Big Bang, when the Universe cooled enough for electrons to bind to nuclei. All chemistry and life is built from atoms."},

  // Life / everyday
  {name:"COVID virus", logR: log10(50e-7), logM: log10(1e-15), cat:"life",
   desc:"SARS-CoV-2 is ~50\u2013100 nm in radius, with mass ~10\u207B\u00B9\u2075 g (~1 femtogram). Viruses lie at the boundary between chemistry and biology \u2014 molecular machines that hijack cellular machinery to replicate. They are among the simplest structures that carry genetic information."},
  {name:"Bacterium", logR: log10(0.5e-4), logM: log10(1e-12), cat:"life",
   desc:"Bacteria (~0.5\u20131 \u03BCm) are single-celled prokaryotes, among the first life forms on Earth (~3.5 Gyr ago). They outnumber human cells in the body and occupy nearly every ecological niche. Their density is close to water (~1 g/cm\u00B3)."},
  {name:"Flea", logR: log10(0.15), logM: log10(5e-4), cat:"life",
   desc:"A flea is ~1.5 mm, massing ~0.5 mg. Fleas can jump ~150\u00D7 their body length. Like all life forms, they lie near the atomic density isodensity line (\u03C1 \u2248 1 g/cm\u00B3)."},
  {name:"Human", logR: log10(50), logM: log10(7e4), cat:"life",
   desc:"Humans: ~50 cm effective radius (assuming sphericity), ~70 kg. Complex multicellular organisms made of ~37 trillion cells. Density ~1 g/cm\u00B3, placing us on the atomic isodensity line alongside all other life and water."},
  {name:"Whale", logR: log10(700), logM: log10(1.5e8), cat:"life",
   desc:"Blue whales are the largest animals ever to live, reaching ~30 m and ~150 tonnes. They too lie on the atomic density line. Their hearts alone weigh ~180 kg."},

  // Solar system
  {name:"Moons and dwarf planets", logR: log10(1.74e8), logM: log10(7.35e25), cat:"solar_system",
   desc:"Earth's Moon: radius 1,740 km, mass 7.35\u00D710\u00B2\u2075 g. The Moon likely formed from a giant impact ~4.5 Gyr ago. Moons and dwarf planets span a wide range; Pluto (r = 1,188 km) and Ceres (r = 473 km) are dwarf planets."},
  {name:"Earth", logR: log10(6.371e8), logM: log10(5.972e27), cat:"solar_system",
   desc:"Earth: radius 6,371 km, mass 5.97\u00D710\u00B2\u2077 g (3\u00D710\u207B\u2076 M\u2609). The densest planet (5.5 g/cm\u00B3) due to its iron core. It sits slightly above the atomic density line. The only known planet with life, liquid water oceans, and plate tectonics."},
  {name:"Planets", logR: log10(7.15e9), logM: log10(1.898e30), cat:"solar_system",
   desc:"Jupiter: radius ~71,500 km, mass ~1.9\u00D710\u00B3\u2030 g (~318 Earth masses). Gas giants are mostly H and He. The planet\u2013brown dwarf boundary is ~13 Jupiter masses, where deuterium fusion begins."},

  // Stars
  {name:"Sun", logR: log10(6.96e10), logM: log10(M_sun), cat:"star",
   desc:"Our Sun: radius 696,000 km, mass 2\u00D710\u00B3\u00B3 g (1 M\u2609). A G2V main sequence star, age ~4.6 Gyr. It converts ~600 million tonnes of hydrogen into helium per second via the pp chain. Surface temperature ~5,800 K."},
  {name:"Brown dwarfs (BD)", logR: log10(5e9), logM: log10(0.05 * M_sun), cat:"star",
   desc:"Brown dwarfs (13\u201380 M_Jup) are too low-mass for sustained hydrogen fusion. They briefly fuse deuterium and are supported by electron degeneracy pressure. They cool over time, bridging the gap between giant planets and stars."},
  {name:"Main sequence stars", logR: log10(4e11), logM: log10(8 * M_sun), cat:"star",
   desc:"Main sequence stars span ~0.08\u2013150 M\u2609. They burn hydrogen in their cores via the pp chain (low mass) or CNO cycle (high mass). The mass\u2013luminosity relation: L \u221D M\u00B3\u00B7\u2075. Their lifetimes range from ~10 Myr (massive) to trillions of years (red dwarfs)."},
  {name:"Red giants", logR: log10(7e12), logM: log10(3 * M_sun), cat:"star",
   desc:"Red giants are post-main-sequence stars that have exhausted core hydrogen. The core contracts while the envelope expands to ~100\u00D7 solar radius. The Sun will become a red giant in ~5 Gyr, eventually engulfing Mercury and Venus."},

  // Compact objects
  {name:"White dwarfs (WD)", logR: log10(6e8), logM: log10(0.7 * M_sun), cat:"compact",
   desc:"White dwarfs: ~Earth-sized, ~0.5\u20131.4 M\u2609. Supported by electron degeneracy pressure. More massive WDs are SMALLER (r \u221D m\u207B\u00B9\u2033\u00B3). The Chandrasekhar limit (~1.4 M\u2609) is the maximum mass; above it, electron degeneracy fails and the star collapses into a neutron star."},
  {name:"Neutron stars (NS)", logR: log10(1.2e6), logM: log10(1.5 * M_sun), cat:"compact",
   desc:"Neutron stars: ~10\u201312 km radius, ~1.4\u20132.2 M\u2609. The densest directly observable objects (\u03C1 ~ 10\u00B9\u2074 g/cm\u00B3, nuclear density). Pulsars are rotating NSs. Above the Tolman\u2013Oppenheimer\u2013Volkoff limit (~2.2 M\u2609), they collapse into black holes."},

  // Black holes (on the BH line: logR = logM + BH_const)
  {name:"Instanton", logR: log10(l_planck), logM: log10(m_planck), cat:"planck",
   desc:"The instanton is a Planck-mass black hole: the smallest possible object. It sits at the intersection of the Schwarzschild and Compton boundaries. Mass = m_P \u2248 2.18\u00D710\u207B\u2075 g, radius = l_P \u2248 1.62\u00D710\u207B\u00B3\u00B3 cm. Its Hawking temperature equals the Planck temperature (~1.42\u00D710\u00B3\u00B2 K). Instantons may represent the initial conditions of the Universe."},
  {name:"Smallest observable PBH", logR: schwarzR(5e14), logM: log10(5e14), cat:"blackhole",
   desc:"The smallest primordial black hole (PBH) that could survive to today has mass ~5\u00D710\u00B9\u2074 g, about the mass of a small asteroid. Its Schwarzschild radius is comparable to a proton's size (~10\u207B\u00B9\u00B3 cm). Lighter PBHs would have evaporated via Hawking radiation."},
  {name:"3K BH", logR: schwarzR(4.5e22), logM: log10(4.5e22), cat:"blackhole",
   desc:"A black hole whose Hawking temperature equals the CMB temperature (2.725 K). Mass ~4.5\u00D710\u00B2\u00B2 g (~Moon mass). Such a BH is in thermal equilibrium with the cosmic microwave background, absorbing and emitting at the same rate."},
  {name:"Stellar mass BH", logR: schwarzR(10 * M_sun), logM: log10(10 * M_sun), cat:"blackhole",
   desc:"Stellar-mass black holes (~3\u201350 M\u2609) form from the core collapse of massive stars (> ~25 M\u2609). The first gravitational wave detection (GW150914, 2015) came from two merging ~30 M\u2609 BHs. They are the most common astrophysical black holes."},
  {name:"Sgr A*", logR: schwarzR(4e6 * M_sun), logM: log10(4e6 * M_sun), cat:"blackhole",
   desc:"Sagittarius A*: the 4\u00D710\u2076 M\u2609 supermassive black hole at the center of our Milky Way. Schwarzschild radius ~12 million km (~0.08 AU). Stars orbit it at thousands of km/s; the closest (S2) reaches 3% the speed of light. Imaged by the EHT in 2022."},
  {name:"Ton 618", logR: schwarzR(66e9 * M_sun), logM: log10(66e9 * M_sun), cat:"blackhole",
   desc:"Ton 618: one of the most massive known black holes at ~66 billion M\u2609. Schwarzschild radius ~1,300 AU. It powers a quasar visible from 10.4 billion light-years. Its density is remarkably low: only ~0.002 g/cm\u00B3 (less than air)."},

  // Galaxies & large scale
  {name:"Globular clusters", logR: log10(3e19), logM: log10(2e5 * M_sun), cat:"galaxy",
   desc:"Globular clusters: ~10\u2013100 ly across, 10\u2074\u201310\u2076 old stars. Among the oldest structures in galaxies (~12 Gyr). They orbit galactic centers in large halos and are nearly spherical due to their great age."},
  {name:"Galaxies", logR: log10(3e22), logM: log10(1e11 * M_sun), cat:"galaxy",
   desc:"Typical galaxies: ~30 kpc radius, ~10\u00B9\u00B9\u201310\u00B9\u00B2 M\u2609 (including dark matter halos). They contain stars, gas, dust, and are dominated by dark matter. Galaxies formed from primordial density fluctuations amplified by gravitational instability."},
  {name:"Milky Way", logR: log10(5e22), logM: log10(1.5e12 * M_sun), cat:"galaxy",
   desc:"Our galaxy: ~50 kpc total radius (including halo), ~1.5\u00D710\u00B9\u00B2 M\u2609 total (most is dark matter). Contains ~200\u2013400 billion stars, spiral arms, a central bar, and the 4\u00D710\u2076 M\u2609 SMBH Sgr A* at its center."},
  {name:"Galaxy clusters", logR: log10(3e25), logM: log10(1e15 * M_sun), cat:"largescale",
   desc:"Galaxy clusters are the largest gravitationally bound structures, ~2\u20135 Mpc across. They contain hundreds to thousands of galaxies, hot intracluster gas (10\u2077\u201310\u2078 K visible in X-rays), and vast dark matter halos. Total mass ~10\u00B9\u2074\u201310\u00B9\u2075 M\u2609."},
  {name:"Superclusters", logR: log10(1e26), logM: log10(1e16 * M_sun), cat:"largescale",
   desc:"Superclusters (~100\u2013300 Mpc) are the largest coherent structures. They are NOT gravitationally bound and are being torn apart by cosmic expansion. Laniakea, our home supercluster, contains ~100,000 galaxies."},
  {name:"Voids", logR: log10(5e25), logM: log10(1e14 * M_sun), cat:"largescale",
   desc:"Cosmic voids are vast underdense regions spanning 20\u2013300 Mpc. They contain very few galaxies and occupy most of the volume of the Universe. The cosmic web of filaments, walls, and clusters surrounds these voids."},

  // Universe
  {name:"Hubble radius", logR: log10(1.37e28), logM: log10(4/3 * Math.PI * (1.37e28)**3 * 9.47e-30), cat:"universe",
   desc:"The Hubble radius r_H = c/H\u2080 \u2248 4.4 Gpc \u2248 1.37\u00D710\u00B2\u2078 cm. The mass within the Hubble volume at critical density is ~4\u00D710\u2075\u2075 g. This point lies ON the black hole line, seemingly suggesting the Universe is a black hole. However, this requires assuming our Universe is surrounded by zero-density Minkowski space. In reality, the Universe beyond r_H has the same density, and the Friedmann metric (not Schwarzschild) applies."},
];

// ============================================================
// ISODENSITY LINES
// ============================================================
// rho = 3m/(4*pi*r^3) => logM = 3*logR + log(4*pi*rho/3)
const isodensityLines = [
  {label: "Planck 10\u2079\u00B3", logRho: 93,
   desc: "The Planck epoch (t < 10\u207B\u2074\u00B3 s). All four fundamental forces are thought to be unified. Quantum gravity dominates at density ~10\u2079\u00B3 g/cm\u00B3. No complete physical theory yet describes this regime.",
   wiki: "Planck_epoch"},
  {label: "GUT 10\u207B\u00B3\u00B2", logRho: 75,
   desc: "Grand Unification epoch (t ~ 10\u207B\u00B3\u2076 s). The strong force separates from the electroweak force as the Universe cools through ~10\u00B9\u2076 GeV. This symmetry breaking may have triggered cosmic inflation.",
   wiki: "Grand_unification_epoch"},
  {label: "EW 10\u207B\u00B9\u00B9", logRho: 25,
   desc: "Electroweak epoch (t ~ 10\u207B\u00B9\u00B2 s). The Higgs field acquires its vacuum expectation value, giving mass to W and Z bosons and separating electromagnetism from the weak force.",
   wiki: "Electroweak_epoch"},
  {label: "nuclear 10\u207B\u2076", logRho: 14.5, tag:"QGP",
   desc: "QCD phase transition (t ~ 10\u207B\u2076 s). Quarks become confined into hadrons (protons, neutrons) as the Universe cools below ~150 MeV. This is nuclear density (~10\u00B9\u2074 g/cm\u00B3) \u2014 the density inside atomic nuclei and neutron stars.",
   wiki: "Quark%E2%80%93gluon_plasma"},
  {label: "atomic 10\u00B3", logRho: 0, tag:"BBN",
   desc: "Big Bang nucleosynthesis (t ~ 3 min). Protons and neutrons fuse into light nuclei (\u00B2H, \u00B3He, \u2074He, \u2077Li). Atomic density (~1 g/cm\u00B3) characterizes ordinary condensed matter \u2014 water, rock, planets, and all living things.",
   wiki: "Big_Bang_nucleosynthesis"},
  {label: "SMBH", logRho: -5,
   desc: "Average density of supermassive black holes (~10\u207B\u2075 g/cm\u00B3). Paradoxically, the most massive black holes have very low average densities \u2014 Ton 618 at 66 billion M\u2609 has average density less than air.",
   wiki: "Supermassive_black_hole"},
  {label: "now 10\u00B9\u2077\u00B7\u2075", logRho: -29.3, tag:"now",
   desc: "The current critical density of the Universe (~9.5 \u00D7 10\u207B\u00B3\u2070 g/cm\u00B3). This is the density required for spatial flatness, as observed by CMB measurements. It corresponds to roughly 5 hydrogen atoms per cubic meter.",
   wiki: "Friedmann_equations"},
];

// ============================================================
// WIKIPEDIA DATA (local images + article links)
// layout: "top" = landscape/square image above text, "side" = portrait image beside text
// ============================================================
const wikiData = {
  "Neutrinos (\u03BD)": { img: "wiki-images/neutrino.jpg", layout: "top", wiki: "Neutrino" },
  "Electron (e)": { img: "wiki-images/electron.jpg", layout: "top", wiki: "Electron" },
  "Proton (p)": { img: "wiki-images/proton.jpg", layout: "top", wiki: "Proton" },
  "Neutron (n)": { img: "wiki-images/neutron.jpg", layout: "top", wiki: "Neutron" },
  "W\u00B1": { img: "wiki-images/w_boson.jpg", layout: "top", wiki: "W_and_Z_bosons" },
  "Higgs (H\u2070)": { img: "wiki-images/higgs.jpg", layout: "side", wiki: "Higgs_boson" },
  "Top quark (t)": { img: "wiki-images/top_quark.jpg", layout: "top", wiki: "Top_quark" },
  "Atoms": { img: "wiki-images/atom.jpg", layout: "top", wiki: "Atom" },
  "COVID virus": { img: "wiki-images/covid.jpg", layout: "top", wiki: "Severe_acute_respiratory_syndrome_coronavirus_2" },
  "Bacterium": { img: "wiki-images/bacteria.jpg", layout: "top", wiki: "Bacteria" },
  "Flea": { img: "wiki-images/flea.jpg", layout: "side", wiki: "Flea" },
  "Human": { img: "wiki-images/human.jpg", layout: "side", wiki: "Human" },
  "Whale": { img: "wiki-images/whale.jpg", layout: "top", wiki: "Blue_whale" },
  "Moons and dwarf planets": { img: "wiki-images/moon.jpg", layout: "top", wiki: "Moon" },
  "Earth": { img: "wiki-images/earth.jpg", layout: "top", wiki: "Earth" },
  "Planets": { img: "wiki-images/jupiter.jpg", layout: "top", wiki: "Jupiter" },
  "Sun": { img: "wiki-images/sun.jpg", layout: "top", wiki: "Sun" },
  "Brown dwarfs (BD)": { img: "wiki-images/brown_dwarf.jpg", layout: "top", wiki: "Brown_dwarf" },
  "Main sequence stars": { img: "wiki-images/main_sequence.jpg", layout: "side", wiki: "Main_sequence" },
  "Red giants": { img: "wiki-images/red_giant.jpg", layout: "side", wiki: "Red_giant" },
  "White dwarfs (WD)": { img: "wiki-images/white_dwarf.jpg", layout: "side", wiki: "White_dwarf" },
  "Neutron stars (NS)": { img: "wiki-images/neutron_star.jpg", layout: "top", wiki: "Neutron_star" },
  "Instanton": { img: "wiki-images/planck.jpg", layout: "top", wiki: "Planck_units" },
  "Smallest observable PBH": { img: "wiki-images/pbh.jpg", layout: "top", wiki: "Primordial_black_hole" },
  "3K BH": { img: "wiki-images/hawking.jpg", layout: "top", wiki: "Hawking_radiation" },
  "Stellar mass BH": { img: "wiki-images/stellar_bh.jpg", layout: "top", wiki: "Stellar_black_hole" },
  "Sgr A*": { img: "wiki-images/sgr_a.jpg", layout: "top", wiki: "Sagittarius_A*" },
  "Ton 618": { img: "wiki-images/ton_618.jpg", layout: "top", wiki: "Ton_618" },
  "Globular clusters": { img: "wiki-images/globular_cluster.jpg", layout: "top", wiki: "Globular_cluster" },
  "Galaxies": { img: "wiki-images/galaxy.jpg", layout: "top", wiki: "Galaxy" },
  "Milky Way": { img: "wiki-images/milky_way.jpg", layout: "top", wiki: "Milky_Way" },
  "Galaxy clusters": { img: "wiki-images/galaxy_cluster.jpg", layout: "top", wiki: "Galaxy_cluster" },
  "Superclusters": { img: "wiki-images/supercluster.jpg", layout: "top", wiki: "Supercluster" },
  "Voids": { img: "wiki-images/void.jpg", layout: "top", wiki: "Void_(astronomy)" },
  "Hubble radius": { img: "wiki-images/observable_universe.jpg", layout: "top", wiki: "Observable_universe" },
};

// ============================================================
// CATEGORY COLORS
// ============================================================
const catCol = {
  particle:'#3366cc', atomic:'#339966', life:'#228855',
  solar_system:'#2288aa', star:'#cc8800', compact:'#cc5500',
  blackhole:'#111', planck:'#cc9900',
  galaxy:'#7744bb', largescale:'#5566cc', universe:'#cc2244',
};
