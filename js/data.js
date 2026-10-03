/*
 * Water Water — static reference data.
 *
 * SAMPLE_POINTS is an ILLUSTRATIVE demo dataset. Locations are real places, but
 * the readings are synthetic and exist only to exercise the map, heat layer and
 * proximity engine. Replace them with live feeds (see js/sources.js) before any
 * public launch.
 */

// Contamination index: 0 = pristine, 100 = severe toxicity.
const RISK_BANDS = [
  { max: 20, key: 'optimal', label: 'Optimal', color: '#1f7ae0' },
  { max: 40, key: 'safe', label: 'Safe', color: '#1fa67a' },
  { max: 60, key: 'caution', label: 'Caution', color: '#e0a21f' },
  { max: 80, key: 'unsafe', label: 'Unsafe', color: '#d4561c' },
  { max: 101, key: 'severe', label: 'Severe toxicity', color: '#9e1028' },
];

const SITE_TYPES = {
  treatment: 'Treatment centre',
  well: 'Open well / borehole',
  reservoir: 'Reservoir',
  coastal: 'Coastal test point',
  river: 'River / surface intake',
  spring: 'Protected spring',
};

// [name, type, lat, lng, index, sampled (YYYY-MM-DD), readings]
// Readings units: metals µg/L, nitrate & fluoride mg/L, PFAS ng/L (PFOA+PFOS),
// e_coli CFU/100 mL, microplastics particles/L.
const RAW_POINTS = [
  ['Thames — Hampton intake', 'river', 51.4106, -0.3683, 34, '2026-08-12', { nitrate: 31, e_coli: 0, pfas: 9 }],
  ['Coppermills Treatment Works, London', 'treatment', 51.5806, -0.0412, 12, '2026-09-02', { lead: 2, nitrate: 18, e_coli: 0 }],
  ['Seine — Ivry-sur-Seine intake', 'river', 48.8156, 2.3929, 38, '2026-07-28', { nitrate: 27, pfas: 14 }],
  ['Vienna I. Hochquellenleitung (Kaiserbrunn)', 'spring', 47.7536, 15.7956, 4, '2026-08-30', { nitrate: 3, e_coli: 0 }],
  ['Munich — Mangfall valley wells', 'well', 47.8553, 11.7914, 6, '2026-08-21', { nitrate: 6, e_coli: 0 }],
  ['Rhine — Lobith monitoring station', 'river', 51.8622, 6.1083, 44, '2026-08-05', { pfas: 22, microplastics: 9 }],
  ['Reykjavík — Gvendarbrunnar', 'spring', 64.1003, -21.7631, 3, '2026-06-18', { e_coli: 0 }],
  ['Lake Baikal — Listvyanka', 'reservoir', 51.8510, 104.8656, 7, '2026-07-10', { e_coli: 0, microplastics: 2 }],
  ['Flint — Water Treatment Plant', 'treatment', 43.0293, -83.6680, 46, '2026-08-14', { lead: 14, e_coli: 0 }],
  ['Lake Michigan — Chicago Jardine intake', 'treatment', 41.8930, -87.6100, 18, '2026-09-01', { lead: 4, pfas: 3 }],
  ['Cape Fear River — Wilmington', 'river', 34.2257, -77.9447, 72, '2026-08-19', { pfas: 140 }],
  ['Central Valley well, Tulare County', 'well', 36.2077, -119.3473, 76, '2026-07-22', { nitrate: 74, arsenic: 18 }],
  ['Los Angeles Aqueduct — Sylmar', 'treatment', 34.3236, -118.4917, 16, '2026-08-27', { arsenic: 4 }],
  ['Hetch Hetchy — San Francisco', 'reservoir', 37.9466, -119.7880, 5, '2026-09-08', { e_coli: 0 }],
  ['Mexico City — Cutzamala delivery', 'treatment', 19.3570, -99.2540, 41, '2026-07-30', { e_coli: 2, lead: 6 }],
  ['Rio Bogotá — Alicachín', 'river', 4.5869, -74.2581, 89, '2026-06-25', { e_coli: 4500, mercury: 4, cadmium: 5 }],
  ['Lima — La Atarjea plant', 'treatment', -12.0293, -76.9946, 29, '2026-08-08', { arsenic: 7 }],
  ['Matanza-Riachuelo, Buenos Aires', 'river', -34.6520, -58.3640, 91, '2026-07-04', { lead: 48, cadmium: 9, e_coli: 6200 }],
  ['Guarani aquifer — Ribeirão Preto', 'well', -21.1775, -47.8103, 9, '2026-08-01', { nitrate: 5 }],
  ['Copacabana coastal point, Rio', 'coastal', -22.9711, -43.1822, 58, '2026-08-23', { e_coli: 380, microplastics: 15 }],
  ['Lagos Lagoon — Ebute Metta', 'coastal', 6.4774, 3.3829, 87, '2026-07-16', { e_coli: 3800, lead: 31 }],
  ['Accra — Weija treatment plant', 'treatment', 5.5682, -0.3338, 37, '2026-08-11', { e_coli: 0, nitrate: 12 }],
  ['Kano — community borehole', 'well', 12.0022, 8.5919, 63, '2026-06-30', { fluoride: 3.1, e_coli: 25 }],
  ['Nairobi — Ngethu treatment works', 'treatment', -0.9640, 36.9440, 32, '2026-08-17', { fluoride: 1.4 }],
  ['Rift Valley borehole, Nakuru', 'well', -0.3031, 36.0800, 79, '2026-07-02', { fluoride: 8.2 }],
  ['Kibera standpipe, Nairobi', 'well', -1.3133, 36.7880, 84, '2026-07-19', { e_coli: 2100, giardia: 'detected' }],
  ['Cape Town — Faure WTP', 'treatment', -34.0080, 18.7450, 15, '2026-09-04', { e_coli: 0 }],
  ['Cairo — Nile, Rod El Farag', 'river', 30.0870, 31.2440, 61, '2026-07-26', { e_coli: 420, nitrate: 22 }],
  ['Sana\'a basin well', 'well', 15.3694, 44.1910, 82, '2026-05-29', { e_coli: 900, cholera: 'detected' }],
  ['Jubail SWRO plant', 'treatment', 27.0174, 49.6583, 14, '2026-08-29', { e_coli: 0 }],
  ['Sorek desalination plant', 'treatment', 31.9330, 34.6900, 11, '2026-09-03', { e_coli: 0 }],
  ['Aral Sea basin well, Nukus', 'well', 42.4531, 59.6103, 78, '2026-06-12', { nitrate: 58, arsenic: 22 }],
  ['Yamuna — Okhla barrage, Delhi', 'river', 28.5440, 77.3060, 94, '2026-07-07', { e_coli: 9800, lead: 52, cadmium: 7 }],
  ['Ganga — Varanasi ghats', 'river', 25.3080, 83.0100, 88, '2026-07-14', { e_coli: 7100 }],
  ['West Bengal tube well, Nadia', 'well', 23.4710, 88.5560, 86, '2026-06-20', { arsenic: 120 }],
  ['Chennai — Minjur desalination', 'treatment', 13.2780, 80.3320, 19, '2026-08-25', { e_coli: 0 }],
  ['Dhaka — Buriganga, Sadarghat', 'river', 23.7055, 90.4060, 95, '2026-07-01', { cadmium: 11, lead: 61, e_coli: 11000 }],
  ['Bangladesh tube well, Comilla', 'well', 23.4607, 91.1809, 81, '2026-06-27', { arsenic: 95 }],
  ['Citarum River — Bandung', 'river', -6.9890, 107.5600, 96, '2026-06-15', { lead: 70, mercury: 9, cadmium: 12 }],
  ['Jakarta coastal — Muara Angke', 'coastal', -6.1040, 106.7700, 83, '2026-07-21', { e_coli: 5200, microplastics: 40 }],
  ['Singapore — NEWater, Bedok', 'treatment', 1.3290, 103.9470, 6, '2026-09-06', { e_coli: 0 }],
  ['Manila Bay — Baseco', 'coastal', 14.5900, 120.9600, 85, '2026-07-12', { e_coli: 6400 }],
  ['Shanghai — Qingcaosha reservoir', 'reservoir', 31.4290, 121.6600, 27, '2026-08-09', { nitrate: 9, pfas: 6 }],
  ['Tai Lake — Wuxi intake', 'reservoir', 31.4910, 120.2040, 57, '2026-07-29', { nitrate: 33, microplastics: 12 }],
  ['Tokyo — Kanamachi purification plant', 'treatment', 35.7660, 139.8760, 8, '2026-09-05', { e_coli: 0 }],
  ['Seoul — Arisu Ttukdo plant', 'treatment', 37.5310, 127.0670, 10, '2026-09-07', { e_coli: 0 }],
  ['Murray River — Mannum', 'river', -34.9149, 139.3020, 36, '2026-08-03', { nitrate: 11 }],
  ['Sydney — Warragamba Dam', 'reservoir', -33.8880, 150.6000, 13, '2026-08-28', { e_coli: 0 }],
  ['Fiji — Yaqara artesian aquifer', 'well', -17.4380, 177.9400, 4, '2026-07-24', { e_coli: 0 }],
  ['Canterbury Plains well, NZ', 'well', -43.6000, 172.0000, 47, '2026-08-15', { nitrate: 41 }],
];

const SAMPLE_POINTS = RAW_POINTS.map(([name, type, lat, lng, index, sampled, readings], i) => ({
  id: 'pt' + i, name, type, lat, lng, index, sampled, readings,
}));

/* ---------- Module 2: toxicological matrix ---------- */
// Guideline values: WHO Guidelines for Drinking-water Quality (4th ed. + addenda);
// US EPA MCLs where noted. Always check the current regulatory text locally.
const CONTAMINANTS = [
  {
    key: 'lead', name: 'Lead (Pb)', group: 'Heavy metal', unit: 'µg/L',
    who: '10 µg/L (provisional) — no known safe level', epa: 'Action level 15 µg/L; MCLG 0',
    sources: 'Lead service lines, solder, brass fittings, corroding plumbing.',
    systems: ['Neurological', 'Developmental', 'Renal', 'Cardiovascular'],
    acute: 'Abdominal pain, fatigue, anaemia at high exposure.',
    chronic: 'Irreversible IQ loss and behavioural disorders in children; hypertension and kidney damage in adults; miscarriage and low birth weight.',
    vulnerable: 'Infants, children under 6, pregnant people.',
    treatment: ['ro', 'ion', 'carbon'],
  },
  {
    key: 'arsenic', name: 'Arsenic (As)', group: 'Heavy metal', unit: 'µg/L',
    who: '10 µg/L (provisional)', epa: 'MCL 10 µg/L',
    sources: 'Naturally occurring in groundwater (Bengal basin, Andes, US Southwest); mining, wood preservatives.',
    systems: ['Dermal', 'Carcinogenic', 'Cardiovascular', 'Developmental'],
    acute: 'Vomiting, diarrhoea, muscle cramps.',
    chronic: 'Skin lesions, cancers of skin, bladder and lung; cardiovascular disease; impaired child cognitive development.',
    vulnerable: 'Communities on untested tube wells; children.',
    treatment: ['ro', 'adsorption', 'coag'],
  },
  {
    key: 'mercury', name: 'Mercury (Hg)', group: 'Heavy metal', unit: 'µg/L',
    who: '6 µg/L (inorganic)', epa: 'MCL 2 µg/L',
    sources: 'Artisanal gold mining, coal combustion, industrial discharge.',
    systems: ['Neurological', 'Renal', 'Developmental'],
    acute: 'Gastrointestinal irritation, kidney injury.',
    chronic: 'Tremors, memory loss and peripheral neuropathy; fetal brain damage (especially methylmercury via the food chain).',
    vulnerable: 'Fetuses, infants, subsistence fishing communities.',
    treatment: ['ro', 'carbon', 'ion'],
  },
  {
    key: 'cadmium', name: 'Cadmium (Cd)', group: 'Heavy metal', unit: 'µg/L',
    who: '3 µg/L', epa: 'MCL 5 µg/L',
    sources: 'Galvanised pipe corrosion, batteries, phosphate fertilisers, mining waste.',
    systems: ['Renal', 'Skeletal', 'Carcinogenic'],
    acute: 'Nausea, vomiting, abdominal cramps.',
    chronic: 'Kidney tubular damage and failure; bone demineralisation (itai-itai disease); lung and prostate cancer risk.',
    vulnerable: 'People with existing kidney disease; older adults.',
    treatment: ['ro', 'ion', 'coag'],
  },
  {
    key: 'pfas', name: 'PFAS ("forever chemicals")', group: 'Synthetic chemical', unit: 'ng/L',
    who: 'Provisional 100 ng/L each for PFOA and PFOS (2022 draft)', epa: 'MCL 4 ng/L each for PFOA and PFOS (2024 rule)',
    sources: 'Firefighting foam, non-stick and water-repellent manufacturing, landfill leachate.',
    systems: ['Endocrine', 'Immune', 'Carcinogenic', 'Hepatic'],
    acute: 'Rarely acute at drinking-water levels.',
    chronic: 'Thyroid disruption, reduced vaccine response, raised cholesterol, kidney and testicular cancer; bioaccumulates for years.',
    vulnerable: 'Pregnant people, infants on formula, communities near airbases and fluorochemical plants.',
    treatment: ['ro', 'carbon', 'ion'],
  },
  {
    key: 'fluoride', name: 'Fluoride (over-saturation)', group: 'Synthetic / geogenic', unit: 'mg/L',
    who: '1.5 mg/L', epa: 'MCL 4.0 mg/L; secondary 2.0 mg/L',
    sources: 'Volcanic and granitic geology (East African Rift, India, China); excess dosing.',
    systems: ['Skeletal', 'Dental', 'Neurological'],
    acute: 'Nausea and vomiting after dosing accidents.',
    chronic: 'Dental fluorosis above ~1.5 mg/L; crippling skeletal fluorosis with long exposure above ~4 mg/L; possible neurodevelopmental effects at high levels.',
    vulnerable: 'Children during tooth formation; people drinking from deep boreholes.',
    treatment: ['ro', 'adsorption'],
  },
  {
    key: 'nitrate', name: 'Nitrate (NO₃⁻)', group: 'Agricultural runoff', unit: 'mg/L',
    who: '50 mg/L as nitrate', epa: 'MCL 10 mg/L as nitrogen (≈ 44 mg/L as nitrate)',
    sources: 'Fertiliser and manure runoff, septic systems.',
    systems: ['Blood (oxygen transport)', 'Endocrine', 'Carcinogenic'],
    acute: 'Methaemoglobinaemia ("blue baby syndrome") in formula-fed infants.',
    chronic: 'Thyroid effects; associated with colorectal cancer and adverse pregnancy outcomes in some studies.',
    vulnerable: 'Infants under 6 months, pregnant people.',
    treatment: ['ro', 'ion'],
  },
  {
    key: 'microplastics', name: 'Microplastics', group: 'Synthetic particle', unit: 'particles/L',
    who: 'No guideline yet (WHO 2019/2022 reviews: evidence insufficient)', epa: 'Not regulated',
    sources: 'Degraded packaging, synthetic textiles, tyre wear, PET bottles themselves.',
    systems: ['Endocrine (additives)', 'Inflammatory', 'Under study'],
    acute: 'None established.',
    chronic: 'Carriers of additives such as BPA and phthalates; inflammation and tissue accumulation under active research.',
    vulnerable: 'Unknown — precautionary reduction advised.',
    treatment: ['ro', 'filtration'],
  },
  {
    key: 'e_coli', name: 'E. coli', group: 'Biological pathogen', unit: 'CFU/100 mL',
    who: 'Must not be detectable in any 100 mL sample', epa: 'Total coliform rule: zero E. coli',
    sources: 'Sewage and animal faeces; indicator of faecal contamination.',
    systems: ['Gastrointestinal', 'Renal (HUS)'],
    acute: 'Diarrhoea, cramps, vomiting; O157:H7 can cause haemolytic uraemic syndrome.',
    chronic: 'Repeated infection drives child stunting and malnutrition.',
    vulnerable: 'Children under 5, elderly, immunocompromised.',
    treatment: ['boil', 'chlorine', 'uv', 'ro'],
  },
  {
    key: 'giardia', name: 'Giardia lamblia', group: 'Biological pathogen', unit: 'cysts',
    who: 'No detectable cysts; treatment-based control', epa: '99.9% removal/inactivation required',
    sources: 'Faecally contaminated surface water; cysts resist chlorine.',
    systems: ['Gastrointestinal'],
    acute: 'Giardiasis: greasy diarrhoea, bloating, weight loss lasting weeks.',
    chronic: 'Malabsorption and failure to thrive in children.',
    vulnerable: 'Children, hikers drinking untreated stream water.',
    treatment: ['boil', 'filtration', 'uv'],
  },
  {
    key: 'cholera', name: 'Vibrio cholerae (Cholera)', group: 'Biological pathogen', unit: 'presence',
    who: 'Must not be present', epa: 'Covered by faecal indicator rules',
    sources: 'Sewage-contaminated water after floods, conflict, or infrastructure collapse.',
    systems: ['Gastrointestinal', 'Circulatory (dehydration)'],
    acute: 'Profuse watery diarrhoea; death from dehydration within hours if untreated.',
    chronic: 'Endemic cycles where sanitation is absent.',
    vulnerable: 'Displaced populations, children, malnourished people.',
    treatment: ['boil', 'chlorine', 'uv'],
  },
];

const TREATMENTS = {
  ro: 'Reverse osmosis', ion: 'Ion exchange', carbon: 'Activated carbon',
  adsorption: 'Activated alumina / iron adsorption', coag: 'Coagulation-filtration',
  filtration: '≤1 µm filtration', boil: 'Rolling boil (1 min)', chlorine: 'Chlorination',
  uv: 'UV disinfection',
};

/* ---------- Module 3: scarcity & potability ---------- */
const POTABILITY = {
  critical: {
    title: 'Unfit to Drink — Critical Risk',
    blurb: 'Heavy industrial runoff, untreated sewage, or high toxic loads. Do not drink without full treatment.',
    regions: [
      { name: 'Citarum basin, Indonesia', why: 'Textile-industry heavy metals and untreated domestic sewage.' },
      { name: 'Yamuna, Delhi stretch, India', why: 'Untreated sewage outfalls; faecal coliforms far above bathing limits.' },
      { name: 'Buriganga, Dhaka, Bangladesh', why: 'Tannery chromium and lead, sewage discharge.' },
      { name: 'Matanza-Riachuelo, Argentina', why: 'Legacy industrial metals and sewage.' },
      { name: 'Bengal basin groundwater', why: 'Geogenic arsenic in shallow tube wells.' },
      { name: 'Lake Karachay basin, Russia', why: 'Legacy radioactive waste contamination.' },
    ],
  },
  scarce: {
    title: 'Water Scarce — Physical & Economic',
    blurb: 'Drought, depleted aquifers, or missing infrastructure. Water may be clean but unavailable.',
    regions: [
      { name: 'Sahel & Horn of Africa', why: 'Economic scarcity plus recurring drought; low piped coverage.', kind: 'Economic + physical' },
      { name: 'Central Asia — Aral Sea basin', why: 'Irrigation diversion collapsed the sea; saline, polluted groundwater.', kind: 'Physical' },
      { name: 'Middle East & North Africa', why: 'Extreme baseline water stress; reliance on desalination and fossil aquifers.', kind: 'Physical' },
      { name: 'Indo-Gangetic Plain', why: 'Groundwater depletion from pumping for irrigation.', kind: 'Physical' },
      { name: 'US Southwest / Colorado River', why: 'Over-allocated river and long-term drought.', kind: 'Physical' },
      { name: 'Yemen', why: 'Aquifer depletion compounded by conflict-damaged infrastructure.', kind: 'Economic + physical' },
    ],
  },
  haven: {
    title: 'Definitive Safe Havens',
    blurb: 'Protected sources with exceptional baseline quality. Natural water can still carry pathogens — treat or test before drinking at source.',
    regions: [
      { name: 'Lake Baikal, Russia', why: 'Largest freshwater lake by volume; endemic filter-feeding fauna.' },
      { name: 'Vienna alpine spring mains, Austria', why: 'Spring water from protected karst catchments, piped largely untreated.' },
      { name: 'Gvendarbrunnar, Iceland', why: 'Lava-filtered groundwater supplying Reykjavík without treatment.' },
      { name: 'Mangfall valley, Germany', why: 'Protected catchment supplying Munich with untreated groundwater.' },
      { name: 'Yaqara artesian aquifer, Fiji', why: 'Confined volcanic aquifer, naturally filtered.' },
      { name: 'Guarani aquifer (protected zones), South America', why: 'One of the largest aquifers; quality varies where recharge zones are farmed.' },
    ],
  },
};

/* ---------- Module 6: crowdfunded relief ledger (demo) ---------- */
const RELIEF_LEDGER = [
  { id: 'r1', community: 'Flood-displaced camps, Sindh (Pakistan)', crisis: 'Flood / cholera risk', people: 42000, goalCartons: 250000, fundedCartons: 118400 },
  { id: 'r2', community: 'Drought villages, Turkana (Kenya)', crisis: 'Drought / fluoride', people: 18500, goalCartons: 120000, fundedCartons: 74100 },
  { id: 'r3', community: 'Earthquake shelters, Hatay (Türkiye)', crisis: 'Infrastructure loss', people: 26000, goalCartons: 160000, fundedCartons: 139900 },
  { id: 'r4', community: 'Arsenic-affected villages, Nadia (India)', crisis: 'Arsenic', people: 9800, goalCartons: 60000, fundedCartons: 12750 },
  { id: 'r5', community: 'Cyclone-hit coast, Sofala (Mozambique)', crisis: 'Cyclone / saltwater intrusion', people: 31000, goalCartons: 190000, fundedCartons: 40300 },
];
