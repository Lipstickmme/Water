/*
 * Water Water — research index.
 *
 * Every finding here summarises published research or an official report.
 * Nothing is a measurement made by Water Water. Findings describe documented
 * problems at a regional or national scale; an individual tap can differ.
 *
 * Finding shape: { s: substance key, t: summary, src: citation, q: search query for the source }
 */

const SUBSTANCES = {
  arsenic:    { name: 'Arsenic',            sym: 'As',   color: '#8e5bd8', limit: 'WHO 10 µg/L',  health: 'Long-term exposure causes skin lesions and cancers of the skin, bladder and lung, and harms heart health and child development.' },
  lead:       { name: 'Lead',               sym: 'Pb',   color: '#5b6b7d', limit: 'WHO 10 µg/L — no safe level', health: 'Damages the developing brain (lower IQ, behaviour problems), raises blood pressure and harms kidneys.' },
  fluoride:   { name: 'Fluoride (excess)',  sym: 'F',    color: '#1aa595', limit: 'WHO 1.5 mg/L', health: 'Above ~1.5 mg/L mottles teeth; years above ~4 mg/L can cripple bones and joints (skeletal fluorosis).' },
  nitrate:    { name: 'Nitrate',            sym: 'NO₃',  color: '#6ba539', limit: 'WHO 50 mg/L',  health: 'Can cause "blue baby syndrome" in formula-fed infants; linked to thyroid effects and some cancers.' },
  pfas:       { name: 'PFAS',               sym: 'PFAS', color: '#d9558e', limit: 'US EPA 4 ng/L (PFOA, PFOS)', health: '"Forever chemicals" linked to thyroid disruption, weaker vaccine response, high cholesterol and kidney and testicular cancer.' },
  microbes:   { name: 'Faecal bacteria',    sym: 'E.coli', color: '#e8913a', limit: 'WHO 0 per 100 mL', health: 'Signals sewage contamination; causes diarrhoeal disease, cholera and typhoid, and drives child stunting.' },
  mercury:    { name: 'Mercury',            sym: 'Hg',   color: '#c0485a', limit: 'WHO 6 µg/L',   health: 'Toxic to the nervous system and kidneys; especially harmful to unborn babies.' },
  uranium:    { name: 'Uranium',            sym: 'U',    color: '#c29a1b', limit: 'WHO 30 µg/L',  health: 'Chemically toxic to the kidneys at high long-term intake.' },
  pesticides: { name: 'Pesticide residues', sym: 'Pest', color: '#8d6e63', limit: 'EU 0.1 µg/L each', health: 'Some residues and their breakdown products are suspected endocrine disruptors or carcinogens.' },
  microplastics: { name: 'Microplastics',   sym: 'MP',   color: '#4a90c2', limit: 'No guideline yet', health: 'Health effects are still being studied; particles can carry additives like BPA and phthalates.' },
};

// Documented contamination zones drawn on the map. r is an approximate radius in km.
const HOTSPOTS = [
  { s: 'arsenic', name: 'Bengal Delta', cc: 'bd', lat: 23.5, lng: 89.5, r: 300, t: 'Shallow tube wells across the delta draw naturally arsenic-rich groundwater.', src: 'BGS & DPHE, 2001', q: 'BGS DPHE 2001 arsenic contamination of groundwater in Bangladesh' },
  { s: 'arsenic', name: 'Middle Ganga Plain', cc: 'in', lat: 25.6, lng: 85.1, r: 200, t: 'Arsenic above limits in groundwater along the Ganga in Bihar and Uttar Pradesh.', src: 'Central Ground Water Board (India)', q: 'CGWB arsenic groundwater Bihar Uttar Pradesh' },
  { s: 'arsenic', name: 'Indus Plain', cc: 'pk', lat: 30.0, lng: 71.5, r: 300, t: 'Modelling estimated 50–60 million people may drink high-arsenic groundwater.', src: 'Podgorski et al., Science Advances 2017', q: 'Podgorski 2017 extensive arsenic contamination in high-pH unconfined aquifers in the Indus Valley' },
  { s: 'arsenic', name: 'Red River Delta', cc: 'vn', lat: 20.8, lng: 105.9, r: 100, t: 'High arsenic found in household wells around Hanoi.', src: 'Berg et al., Environ. Sci. Technol. 2001', q: 'Berg 2001 arsenic contamination of groundwater and drinking water in Vietnam' },
  { s: 'arsenic', name: 'Mekong lowlands', cc: 'kh', lat: 11.5, lng: 105.0, r: 120, t: 'Arsenic-rich groundwater in wells along the Mekong in Cambodia.', src: 'Polya et al. / Berg et al., 2000s', q: 'arsenic groundwater Cambodia Mekong Kandal study' },
  { s: 'arsenic', name: 'Hetao Basin', cc: 'cn', lat: 40.8, lng: 107.5, r: 150, t: 'One of China’s main geogenic arsenic areas in Inner Mongolia.', src: 'Rodríguez-Lado et al., Science 2013', q: 'Rodriguez-Lado 2013 groundwater arsenic contamination throughout China Science' },
  { s: 'arsenic', name: 'Chaco-Pampean Plain', cc: 'ar', lat: -33.5, lng: -62.5, r: 400, t: 'Naturally elevated arsenic in groundwater over a vast area of central Argentina.', src: 'Bundschuh et al., 2012', q: 'Bundschuh arsenic Chaco-Pampean plain Argentina groundwater' },
  { s: 'arsenic', name: 'Antofagasta', cc: 'cl', lat: -23.6, lng: -70.4, r: 120, t: 'Historic exposure to very high arsenic in public water, linked to raised cancer rates.', src: 'Smith et al., 1998 & follow-ups', q: 'Antofagasta arsenic drinking water cancer Smith' },
  { s: 'arsenic', name: 'Viterbo (Lazio)', cc: 'it', lat: 42.42, lng: 12.1, r: 40, t: 'Volcanic geology raises arsenic in local supplies; EU derogations were needed.', src: 'Regione Lazio / ISS', q: 'Viterbo arsenic drinking water Lazio' },
  { s: 'nitrate', name: 'Central Valley, California', cc: 'us', lat: 36.5, lng: -119.8, r: 200, t: 'Fertiliser and dairy runoff push nitrate above limits in many rural wells.', src: 'UC Davis report to the State Water Board, 2012', q: 'Harter 2012 addressing nitrate in California drinking water UC Davis' },
  { s: 'nitrate', name: 'Central Iowa', cc: 'us', lat: 41.6, lng: -93.6, r: 150, t: 'Des Moines Water Works runs one of the world’s largest nitrate-removal plants.', src: 'Des Moines Water Works', q: 'Des Moines Water Works nitrate removal facility' },
  { s: 'nitrate', name: 'Brittany', cc: 'fr', lat: 48.2, lng: -3.0, r: 120, t: 'Intensive livestock farming drives high nitrate in rivers and green-algae blooms.', src: 'French national water monitoring', q: 'Brittany nitrate water pollution agriculture' },
  { s: 'fluoride', name: 'Kenyan Rift Valley', cc: 'ke', lat: -0.5, lng: 36.1, r: 250, t: 'Volcanic rocks give boreholes fluoride far above guidelines; fluorosis is common.', src: 'Podgorski & Berg, Nature Comms 2022', q: 'Podgorski Berg 2022 global analysis and prediction of fluoride in groundwater' },
  { s: 'fluoride', name: 'Ethiopian Rift Valley', cc: 'et', lat: 7.9, lng: 38.7, r: 200, t: 'High-fluoride groundwater affects millions in the Rift lakes region.', src: 'Rango et al., 2012', q: 'Rango fluoride Ethiopian Rift Valley groundwater' },
  { s: 'fluoride', name: 'Arusha region', cc: 'tz', lat: -3.4, lng: 36.7, r: 100, t: 'Some of the highest groundwater fluoride levels recorded, near Mount Meru.', src: 'Tanzanian Ministry of Water & studies', q: 'fluoride groundwater Arusha Mount Meru' },
  { s: 'fluoride', name: 'Rajasthan', cc: 'in', lat: 26.9, lng: 73.0, r: 300, t: 'Most districts report groundwater fluoride above the Indian standard.', src: 'Central Ground Water Board (India)', q: 'CGWB fluoride groundwater Rajasthan districts' },
  { s: 'uranium', name: 'Punjab', cc: 'in', lat: 30.9, lng: 75.3, r: 150, t: 'Widespread uranium above WHO guidance in groundwater across north-west India.', src: 'Coyte et al., ES&T Letters 2018', q: 'Coyte 2018 large-scale uranium contamination of groundwater resources in India' },
  { s: 'pfas', name: 'Cape Fear River', cc: 'us', lat: 34.6, lng: -78.4, r: 100, t: 'GenX and other PFAS from a fluorochemical plant found in Wilmington’s drinking water.', src: 'Sun et al., ES&T Letters 2016', q: 'Sun 2016 legacy and emerging perfluoroalkyl substances are important drinking water contaminants in the Cape Fear River' },
  { s: 'pfas', name: 'Veneto', cc: 'it', lat: 45.5, lng: 11.5, r: 50, t: 'PFAS from a chemical plant contaminated water for hundreds of thousands of people.', src: 'Regione Veneto / ISS', q: 'Veneto PFAS contamination Miteni drinking water' },
  { s: 'pfas', name: 'Rastatt', cc: 'de', lat: 48.86, lng: 8.2, r: 25, t: 'PFAS-contaminated compost spread on fields polluted local groundwater.', src: 'LUBW Baden-Württemberg', q: 'Rastatt PFAS groundwater contamination' },
  { s: 'pfas', name: 'Dordrecht', cc: 'nl', lat: 51.8, lng: 4.67, r: 25, t: 'PFAS emissions from a fluorochemical plant studied by the Dutch health institute.', src: 'RIVM', q: 'RIVM PFAS Dordrecht Chemours' },
  { s: 'pfas', name: 'Okinawa', cc: 'jp', lat: 26.3, lng: 127.8, r: 40, t: 'PFAS from military bases detected in local water sources.', src: 'Okinawa Prefecture', q: 'Okinawa PFAS water US bases' },
  { s: 'pfas', name: 'Williamtown', cc: 'au', lat: -32.8, lng: 151.83, r: 15, t: 'Firefighting-foam PFAS from an air base contaminated groundwater.', src: 'Australian Dept. of Defence', q: 'Williamtown PFAS contamination RAAF base' },
  { s: 'lead', name: 'Flint, Michigan', cc: 'us', lat: 43.01, lng: -83.69, r: 15, t: 'A 2014 source switch corroded pipes; children’s blood lead levels rose.', src: 'Hanna-Attisha et al., AJPH 2016', q: 'Hanna-Attisha 2016 elevated blood lead levels in children Flint water crisis' },
  { s: 'lead', name: 'Newark, New Jersey', cc: 'us', lat: 40.735, lng: -74.17, r: 10, t: 'Lead levels exceeded the federal action level in 2017–2019, prompting full lead line replacement.', src: 'City of Newark / NJDEP', q: 'Newark lead service line replacement 2019' },
  { s: 'lead', name: 'Zamfara', cc: 'ng', lat: 12.1, lng: 6.2, r: 80, t: 'Artisanal gold processing caused a mass lead-poisoning outbreak in 2010.', src: 'MSF & US CDC', q: 'Zamfara lead poisoning 2010 artisanal gold mining' },
  { s: 'mercury', name: 'Ghana mining belt', cc: 'gh', lat: 5.9, lng: -1.9, r: 120, t: 'Illegal gold mining ("galamsey") brings mercury and sediment into rivers like the Pra.', src: 'Ghana Water Company / studies', q: 'galamsey mercury Pra river water' },
  { s: 'mercury', name: 'Tapajós basin', cc: 'br', lat: -4.5, lng: -56.0, r: 250, t: 'Gold mining releases mercury that builds up in fish and river communities.', src: 'Fiocruz studies', q: 'Fiocruz mercury Tapajós gold mining' },
  { s: 'microbes', name: 'Hammanskraal', cc: 'za', lat: -25.4, lng: 28.28, r: 15, t: 'A failing wastewater plant contaminated supply; a 2023 cholera outbreak followed.', src: 'SA Human Rights Commission, 2023', q: 'Hammanskraal cholera 2023 Rooiwal wastewater' },
  { s: 'microbes', name: 'Yamuna, Delhi', cc: 'in', lat: 28.6, lng: 77.25, r: 30, t: 'Untreated sewage gives the river very high faecal bacteria and ammonia.', src: 'Central Pollution Control Board (India)', q: 'CPCB Yamuna faecal coliform Delhi' },
];

const REGIONS = {
  us: {
    name: 'United States',
    national: [
      { s: 'lead', t: 'About 9 million lead service lines still serve US homes; a 2024 EPA rule requires replacing them within 10 years.', src: 'US EPA, 2024', q: 'EPA Lead and Copper Rule Improvements 2024 lead service lines' },
      { s: 'pfas', t: 'A national study estimated at least one PFAS is in about 45% of US tap water.', src: 'Smalling et al. (USGS), Environment International 2023', q: 'Smalling 2023 per- and polyfluoroalkyl substances in tap water USGS' },
      { s: 'arsenic', t: 'About 2.1 million people may use private wells above the arsenic standard.', src: 'Ayotte et al. (USGS), ES&T 2017', q: 'Ayotte 2017 estimating the high-arsenic domestic-well population conterminous United States' },
      { s: 'nitrate', t: 'Nitrate above the standard is most common in shallow wells in farming areas.', src: 'USGS National Water-Quality Assessment', q: 'USGS NAWQA nitrate domestic wells agricultural areas' },
    ],
    states: {
      michigan: [{ s: 'pfas', t: 'The state tracks hundreds of PFAS contamination sites.', src: 'Michigan PFAS Action Response Team', q: 'MPART Michigan PFAS sites' }],
      california: [{ s: 'arsenic', t: 'Arsenic and nitrate are the most common contaminants in small rural systems.', src: 'CA State Water Board — SAFER program', q: 'California SAFER drinking water needs assessment arsenic nitrate' }],
      'north carolina': [{ s: 'pfas', t: 'GenX contamination traced to the Fayetteville Works plant.', src: 'NC DEQ', q: 'NC DEQ GenX Chemours Fayetteville Works' }],
      'new jersey': [{ s: 'pfas', t: 'First US state to set a drinking-water limit for a PFAS (PFNA, 2018).', src: 'NJ DEP', q: 'New Jersey PFNA MCL 2018' }],
      iowa: [{ s: 'nitrate', t: 'Farm drainage carries nitrate into the Raccoon and Des Moines rivers.', src: 'Iowa DNR', q: 'Iowa nitrate rivers drinking water Des Moines' }],
    },
  },
  gb: {
    name: 'United Kingdom',
    national: [
      { s: 'lead', t: 'Homes built before about 1970 may still have lead supply pipes.', src: 'Drinking Water Inspectorate', q: 'DWI lead pipes advice' },
      { s: 'nitrate', t: 'More than half of England is designated a Nitrate Vulnerable Zone.', src: 'DEFRA / Environment Agency', q: 'Nitrate vulnerable zones England percentage' },
      { s: 'pfas', t: 'Water companies must monitor PFAS and act when they are detected.', src: 'Drinking Water Inspectorate guidance', q: 'DWI PFAS guidance water companies' },
    ],
  },
  ie: { name: 'Ireland', national: [{ s: 'microbes', t: 'Many private wells test positive for E. coli.', src: 'Environmental Protection Agency (Ireland)', q: 'EPA Ireland private wells E. coli' }] },
  de: {
    name: 'Germany',
    national: [{ s: 'nitrate', t: 'The EU Court of Justice ruled in 2018 that Germany broke the Nitrates Directive.', src: 'CJEU Case C-543/16, 2018', q: 'CJEU C-543/16 Commission v Germany nitrates' }],
  },
  fr: {
    name: 'France',
    national: [
      { s: 'pesticides', t: 'A breakdown product of the fungicide chlorothalonil was found in many drinking-water samples.', src: 'ANSES, 2023', q: 'ANSES 2023 chlorothalonil R471811 drinking water' },
      { s: 'nitrate', t: 'Agricultural nitrate is a persistent problem in western France.', src: 'French national water monitoring', q: 'France nitrate drinking water agriculture' },
    ],
  },
  nl: { name: 'Netherlands', national: [{ s: 'pfas', t: 'The health institute warns PFAS intake is above safe levels for many people.', src: 'RIVM, 2021', q: 'RIVM 2021 PFAS intake exceeds safe level' }] },
  it: { name: 'Italy', national: [{ s: 'pfas', t: 'The Veneto PFAS case is one of Europe’s largest drinking-water contaminations.', src: 'Regione Veneto / ISS', q: 'Veneto PFAS Miteni' }] },
  in: {
    name: 'India',
    national: [
      { s: 'fluoride', t: 'Groundwater fluoride exceeds the standard in parts of most states.', src: 'Central Ground Water Board', q: 'CGWB groundwater quality report fluoride states' },
      { s: 'arsenic', t: 'Arsenic is high in the Ganga–Brahmaputra floodplains.', src: 'Central Ground Water Board', q: 'CGWB arsenic Ganga Brahmaputra' },
      { s: 'nitrate', t: 'Nitrate above limits is widely reported in groundwater samples.', src: 'Central Ground Water Board', q: 'CGWB nitrate groundwater India report' },
      { s: 'microbes', t: 'Faecal contamination of water sources remains common.', src: 'WHO/UNICEF JMP', q: 'JMP India safely managed drinking water' },
    ],
    states: {
      'west bengal': [{ s: 'arsenic', t: 'Arsenic in tube wells across several districts.', src: 'CGWB / PHED West Bengal', q: 'West Bengal arsenic districts tube wells' }],
      bihar: [{ s: 'arsenic', t: 'Arsenic-affected villages along the Ganga.', src: 'CGWB / PHED Bihar', q: 'Bihar arsenic Ganga villages' }],
      punjab: [{ s: 'uranium', t: 'Uranium above WHO guidance in many groundwater samples.', src: 'Coyte et al., 2018', q: 'Coyte 2018 uranium groundwater India Punjab' }],
      rajasthan: [{ s: 'fluoride', t: 'High fluoride in groundwater across many districts.', src: 'CGWB', q: 'Rajasthan fluoride groundwater districts' }],
      delhi: [{ s: 'microbes', t: 'Raw Yamuna water carries heavy sewage loads before treatment.', src: 'CPCB', q: 'Yamuna Delhi pollution CPCB' }],
    },
  },
  bd: {
    name: 'Bangladesh',
    national: [
      { s: 'arsenic', t: 'A national survey found widespread arsenic above the Bangladesh standard in shallow tube wells.', src: 'BGS & DPHE, 2001', q: 'BGS DPHE 2001 arsenic Bangladesh national survey' },
      { s: 'microbes', t: 'E. coli is commonly found in household drinking water.', src: 'UNICEF / BBS MICS 2019', q: 'Bangladesh MICS 2019 water quality E. coli' },
    ],
  },
  pk: { name: 'Pakistan', national: [{ s: 'arsenic', t: 'High-arsenic groundwater is widespread in the Indus plain.', src: 'Podgorski et al., 2017', q: 'Podgorski 2017 arsenic Indus Pakistan' }] },
  np: { name: 'Nepal', national: [{ s: 'arsenic', t: 'Arsenic in tube wells in the southern Terai.', src: 'NASC & ENPHO studies', q: 'Nepal Terai arsenic tube wells' }] },
  cn: {
    name: 'China',
    national: [
      { s: 'arsenic', t: 'Modelling estimated about 19.6 million people at risk from groundwater arsenic.', src: 'Rodríguez-Lado et al., Science 2013', q: 'Rodriguez-Lado 2013 arsenic China Science' },
      { s: 'fluoride', t: 'Endemic fluorosis from groundwater in northern provinces.', src: 'Chinese CDC studies', q: 'China endemic fluorosis drinking water' },
    ],
  },
  vn: { name: 'Vietnam', national: [{ s: 'arsenic', t: 'Arsenic in groundwater of the Red River and Mekong deltas.', src: 'Berg et al., 2001', q: 'Berg 2001 arsenic Vietnam groundwater' }] },
  kh: { name: 'Cambodia', national: [{ s: 'arsenic', t: 'Arsenic in wells along the Mekong and Bassac rivers.', src: 'Cambodian Ministry of Rural Development', q: 'Cambodia arsenic wells Mekong' }] },
  ke: {
    name: 'Kenya',
    national: [
      { s: 'fluoride', t: 'High fluoride in Rift Valley boreholes; dental fluorosis is common.', src: 'Podgorski & Berg, 2022', q: 'fluoride groundwater Kenya Rift Valley' },
      { s: 'microbes', t: 'Faecal contamination of water sources is common, especially in informal settlements.', src: 'WHO/UNICEF JMP', q: 'Kenya drinking water faecal contamination JMP' },
    ],
  },
  et: { name: 'Ethiopia', national: [{ s: 'fluoride', t: 'High-fluoride groundwater in the Rift Valley.', src: 'Rango et al., 2012', q: 'Ethiopia rift fluoride groundwater' }] },
  tz: { name: 'Tanzania', national: [{ s: 'fluoride', t: 'Very high fluoride around Arusha and Kilimanjaro.', src: 'Tanzanian Ministry of Water', q: 'Tanzania fluoride Arusha groundwater' }] },
  ng: {
    name: 'Nigeria',
    national: [
      { s: 'microbes', t: 'E. coli is found in a large share of household drinking water.', src: 'UNICEF / NBS MICS 2021', q: 'Nigeria MICS 2021 water quality E. coli' },
      { s: 'lead', t: 'Mining areas have recorded serious lead contamination.', src: 'MSF & US CDC', q: 'Nigeria lead poisoning mining Zamfara' },
    ],
  },
  gh: { name: 'Ghana', national: [{ s: 'mercury', t: 'Illegal gold mining raises mercury and turbidity in major rivers.', src: 'Ghana Water Company / studies', q: 'Ghana galamsey river water mercury' }] },
  za: {
    name: 'South Africa',
    national: [{ s: 'microbes', t: 'Many municipal systems fail microbiological standards.', src: 'Blue Drop Report, 2023', q: 'Blue Drop report 2023 South Africa drinking water' }],
  },
  mx: { name: 'Mexico', national: [{ s: 'arsenic', t: 'Arsenic and fluoride are elevated in aquifers of the north and centre.', src: 'CONAGUA & academic studies', q: 'Mexico arsenic fluoride groundwater aquifers' }] },
  ar: { name: 'Argentina', national: [{ s: 'arsenic', t: 'Millions live in areas with arsenic-rich groundwater.', src: 'Bundschuh et al., 2012', q: 'Argentina arsenic groundwater population' }] },
  cl: { name: 'Chile', national: [{ s: 'arsenic', t: 'Northern Chile has a long history of high arsenic in water.', src: 'Smith et al.', q: 'Chile Antofagasta arsenic drinking water' }] },
  br: {
    name: 'Brazil',
    national: [
      { s: 'pesticides', t: 'National monitoring regularly detects pesticide residues in tap water.', src: 'SISAGUA (Ministry of Health)', q: 'SISAGUA agrotóxicos água' },
      { s: 'mercury', t: 'Gold mining spreads mercury in Amazon rivers.', src: 'Fiocruz', q: 'Fiocruz mercury Amazon gold mining' },
    ],
  },
  ca: {
    name: 'Canada',
    national: [
      { s: 'lead', t: 'An investigation found lead above the guideline in many homes across cities.', src: 'Investigative journalism consortium, 2019', q: 'Canada lead drinking water investigation 2019' },
      { s: 'microbes', t: 'Some First Nations communities live under long-term drinking-water advisories.', src: 'Indigenous Services Canada', q: 'long-term drinking water advisories First Nations' },
    ],
  },
  au: { name: 'Australia', national: [{ s: 'pfas', t: 'Firefighting foam contaminated water near several defence bases.', src: 'Australian Dept. of Defence', q: 'Australia PFAS defence bases investigation' }] },
  jp: { name: 'Japan', national: [{ s: 'pfas', t: 'PFAS found in groundwater in parts of Tokyo’s Tama area and near bases.', src: 'Tokyo Metropolitan Government', q: 'Tokyo Tama PFAS groundwater' }] },
};

// Global context — shown everywhere.
const GLOBAL_FINDINGS = [
  { s: 'microbes', t: 'About 2.2 billion people still lack safely managed drinking water.', src: 'WHO/UNICEF JMP, 2023', q: 'JMP 2023 progress on household drinking water sanitation hygiene 2.2 billion' },
  { s: 'microplastics', t: 'Microplastic fibres were found in 81% of tap water samples tested worldwide.', src: 'Kosuth et al., PLOS ONE 2018', q: 'Kosuth 2018 anthropogenic contamination of tap water beer and sea salt' },
  { s: 'arsenic', t: 'Up to 94–220 million people may be exposed to high groundwater arsenic.', src: 'Podgorski & Berg, Science 2020', q: 'Podgorski Berg 2020 global threat of arsenic in groundwater' },
];

// Each source links to a web search for its exact title, so it can be checked.
const sourceUrl = q => 'https://www.google.com/search?q=' + encodeURIComponent(q);

/*
 * Health-outcome analytics.
 * "outcome" substances are compared against World Bank indicators across
 * countries with and without documented contamination. Lead uses published
 * dose-response and before/after evidence instead, because no reliable
 * country-level child IQ dataset exists.
 */
const INDICATORS = {
  u5: { wb: 'SH.DYN.MORT', label: 'Under-5 mortality', unit: 'deaths per 1,000 live births', src: 'UN IGME via World Bank' },
  infant: { wb: 'SP.DYN.IMRT.IN', label: 'Infant mortality', unit: 'deaths per 1,000 live births', src: 'UN IGME via World Bank' },
  wash: { wb: 'SH.STA.WASH.P5', label: 'Deaths from unsafe water & sanitation', unit: 'per 100,000 people', src: 'WHO via World Bank' },
};

const ANALYTICS = {
  microbes: { indicators: ['wash', 'u5'], why: 'Diarrhoeal disease from faecally contaminated water is a leading cause of death in children under five.', src: 'WHO, 2023', q: 'WHO burden of disease attributable to unsafe drinking-water sanitation hygiene 2019 update' },
  nitrate: { indicators: ['infant'], why: 'High nitrate can starve formula-fed infants of oxygen (methaemoglobinaemia).', src: 'WHO nitrate background document', q: 'WHO nitrate and nitrite in drinking-water background document' },
  arsenic: { indicators: ['infant', 'u5'], why: 'Arsenic exposure in pregnancy was linked to higher infant death in a Bangladesh cohort.', src: 'Rahman et al., Am. J. Epidemiol. 2007', q: 'Rahman 2007 association of arsenic exposure during pregnancy with fetal loss and infant death Bangladesh' },
  lead: {
    iq: {
      // Pooled analysis of 7 cohorts: cumulative IQ loss vs concurrent blood lead (µg/dL).
      curve: [[2.4, 0], [10, 3.9], [20, 5.8], [30, 6.9]],
      src: 'Lanphear et al., Environ. Health Perspect. 2005', q: 'Lanphear 2005 low-level environmental lead exposure and children\'s intellectual function pooled analysis',
    },
    beforeAfter: {
      title: 'Flint children with elevated blood lead (≥5 µg/dL)',
      bars: [['Before switch', 2.4], ['After switch', 4.9]],
      note: 'No significant rise was seen in children outside the city over the same period.',
      src: 'Hanna-Attisha et al., AJPH 2016', q: 'Hanna-Attisha 2016 elevated blood lead levels in children Flint water crisis',
    },
  },
};

// ISO-2 codes of countries with documented contamination by substance.
function documentedCountries(substance) {
  const set = new Set(HOTSPOTS.filter(h => h.s === substance).map(h => h.cc));
  for (const [cc, r] of Object.entries(REGIONS)) {
    const all = [...r.national, ...Object.values(r.states || {}).flat()];
    if (all.some(f => f.s === substance)) set.add(cc);
  }
  return set;
}
