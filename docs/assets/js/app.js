/* Land Suitability PH: shared site shell + page modules.
   Each page sets <body data-page="home|study-1|study-2|study-3|study-4|study-5">. */
(function () {
  'use strict';
  const PAGE = document.body.dataset.page || 'home';
  const D = window.COMPENDIUM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CLASSES = ['S1', 'S2', 'S3', 'N1', 'N2'];
  const GROUPS = {
    all: 'All crops', cereal: 'Cereals', plantation: 'Plantation & industrial', fruit: 'Fruits', vegetable: 'Vegetables', root: 'Root & tuber crops'
  };
  const GROUP_SHORT = { cereal: 'Cereal', plantation: 'Plantation', fruit: 'Fruit', vegetable: 'Vegetable', root: 'Root & tuber' };
  const STATUS = { done: 'Completed · results available', partial: 'In progress · initial results', wip: 'Work in progress' };

  /* ================= shared helpers ================= */
  const isND = (v) => !v || /^ND$/i.test(v.trim());
  const NUM = '(-?\\d+(?:\\.\\d+)?)';
  function parseInterval(raw) {
    if (!raw || isND(raw)) return null;
    let s = raw.replace(/\(.*?\)/g, '').replace(/\s+also\s+N\d?\b/gi, '').replace(/;\s*/g, ' or ').replace(/[−‑]/g, '-').trim();
    if (!/\d/.test(s) || /[a-z]{4,}/i.test(s.replace(/\b(or|mm|cm|months?|days?)\b/gi, ''))) return null;
    const segs = [];
    for (let p of s.split(/\s+or\s+/i)) {
      p = p.replace(/\s*(°C|%|mm|cm|dS\/m|cmolc\/kg|months?|g\/kg)\s*$/i, '').trim();
      let m;
      if ((m = p.match(new RegExp(`^[<>]?\\s*${NUM}\\s*[–-]\\s*<?\\s*${NUM}$`)))) segs.push([+m[1], +m[2]]);
      else if ((m = p.match(new RegExp(`^(?:≥|>=?)\\s*${NUM}$`)))) segs.push([+m[1], Infinity]);
      else if ((m = p.match(new RegExp(`^(?:≤|<=?)\\s*${NUM}$`)))) segs.push([-Infinity, +m[1]]);
      else if ((m = p.match(new RegExp(`^${NUM}$`)))) segs.push([+m[1], +m[1]]);
      else return null;
    }
    return segs.length ? segs : null;
  }
  function niceTicks(lo, hi, count) {
    const span = hi - lo, step0 = span / count, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || 10 * mag;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }
  const fmt = (v) => (Math.abs(v) >= 1000 ? v.toLocaleString('en-US') : String(+v.toFixed(2)));
  function downloadRows(filename, head, rows) {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [head.map(q).join(',')].concat(rows.map((r) => r.map(q).join(',')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const tip = $('#tooltip');
  function placeTip(x, y) {
    tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let left = x + 14, top = y + 14;
    if (left + w > innerWidth - 8) left = x - w - 14;
    if (top + h > innerHeight - 8) top = y - h - 14;
    tip.style.left = Math.max(8, left) + 'px'; tip.style.top = top + 'px';
  }
  const hideTip = () => { if (tip) tip.hidden = true; };
  if (tip) {
    addEventListener('scroll', hideTip, { passive: true });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.chart, .s3-chart')) { hideTip(); $$('.chart .row, .s3-chart .row').forEach((o) => o.classList.remove('hl')); }
    });
  }

  /* ================= studies (single source for nav, cards and study pages) ================= */
  const reclassSvg = () => {
    const pattern = ['0011223344', '0011122334', '0001112233', '1001112223', '1110011222', '2211001112', '3221100111', '4322110011'];
    let cells = '';
    pattern.forEach((row, y) => [...row].forEach((v, x) => {
      cells += `<rect x="${x * 40 + 1}" y="${y * 28 + 1}" width="38" height="26" rx="3" fill="var(--${CLASSES[+v]})"/>`;
    }));
    return `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="225" fill="#0f3d2e"/>${cells}</svg>`;
  };
  const ahpSvg = () => `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="400" height="225" fill="#0f3d2e"/>
    <g stroke="#6f8f80" stroke-width="1.5" fill="none">
      <path d="M200 52 L80 110 M200 52 L200 110 M200 52 L320 110"/>
      <path d="M80 130 L40 180 M80 130 L120 180 M200 130 L170 180 M200 130 L230 180 M320 130 L290 180 M320 130 L360 180"/>
    </g>
    <rect x="140" y="22" width="120" height="32" rx="8" fill="#d6a21e"/>
    <text x="200" y="43" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#2a1e00">Crop suitability</text>
    ${[['80', 'Climate'], ['200', 'Soil'], ['320', 'Terrain']].map(([x, t]) => `<rect x="${x - 50}" y="106" width="100" height="28" rx="7" fill="#3fae80"/><text x="${x}" y="125" text-anchor="middle" font-family="Inter,sans-serif" font-size="12.5" font-weight="700" fill="#062a1c">${t}</text>`).join('')}
    ${[40, 120, 170, 230, 290, 360].map((x, i) => `<rect x="${x - 26}" y="178" width="52" height="24" rx="6" fill="#f3f1e9"/><text x="${x}" y="194" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1b1f1c">w${i + 1}</text>`).join('')}
  </svg>`;
  const STUDIES = [
    { n: 1, title: 'Compendium of Land Utilization Type Requirements', status: 'done',
      img: 'assets/img/study-1.jpg', alt: 'Coffee cherries ripening on a branch',
      text: 'Literature-based, validated thresholds for climate, soil and terrain factors of 17 major crops, delineated into FAO classes S1–N2.',
      time: 'Jan – Aug 2025 · Validated crop requirements, database, reference list',
      people: 'Jessabel B. Magtoltol (Study Leader) · Hiyasmin Rose L. Benzon (Co-Study Leader)' },
    { n: 2, title: 'Land Use/Land Cover Classification using Unsupervised and Supervised Pixel-based or Object-based Image Classification', short: 'Land Use/Land Cover Classification', status: 'wip',
      img: 'assets/img/study-2.jpg', alt: 'Cloud-free Sentinel-2 satellite mosaic of Mindanao',
      text: 'Unsupervised and supervised pixel-based or object-based classification of Landsat-8, Sentinel-2 and high-resolution imagery to map land cover and NDVI per province.',
      time: 'Aug 2025 – Jun 2026 · Land cover & NDVI maps (provincial)',
      people: 'Nicola Louise T. Timbas (Study Leader) · Darryl Nelo S. Aguila (Project Staff)',
      purpose: [
        'Land cover determines where crops can realistically be grown. Adding it as a criterion lets the suitability model exclude forests, protected areas, built-up land and water bodies, which supports biodiversity conservation, erosion prevention and water resource management.',
        'Study 2 will process Landsat-8 and Sentinel-2 satellite images and high-resolution imagery with supervised and unsupervised classification to map land use/land cover types and the normalized difference vegetation index (NDVI) for each province.'
      ],
      methods: [
        'Acquire Landsat-8 and Sentinel-2 multispectral imagery, plus high-resolution images from Google Earth Pro and SASPlanet.',
        'Classify land use/land cover with unsupervised and supervised methods, comparing pixel-based and object-based approaches.',
        'Compute NDVI to describe vegetation condition for the vegetation criterion.',
        'Produce provincial land cover and NDVI maps and raster files for the suitability overlay in Study 5.'
      ],
      schedule: [
        ['Collection of satellite and high-resolution images', 'Aug – Dec 2025', 'Landsat-8 and Sentinel-2 images; high-resolution images from Google Earth Pro and SASPlanet'],
        ['Image classification', 'Jan – Jun 2026', 'Land cover maps (provincial level)']
      ],
      output: 'Maps and raster files of land use/land cover types and NDVI per province.' },
    { n: 3, title: 'Interpolation of Climatic Parameters using Deterministic and Geostatistical Methods and Processing of Secondary Soil and Topographic Data', short: 'Climate Interpolation & Soil and Topographic Data', status: 'partial',
      img: 'assets/img/study3/annual-precipitation-ebk.jpg', alt: 'Interpolated annual precipitation map of the Philippines', imgPos: '30% 35%;transform:scale(1.6);transform-origin:30% 42%',
      text: 'PAGASA climatological normals interpolated with 14 geostatistical and deterministic models. Empirical Bayesian Kriging gave the most accurate annual precipitation and mean temperature surfaces. Soil and topographic layers come next.',
      time: 'Jan – Aug 2025 progress · Climate surfaces & cross-validation results',
      people: 'Marcial S. Buladaco II (Study Leader) · Jessabel B. Magtoltol (Project Staff)' },
    { n: 4, title: 'Derivation of Criteria and Sub-Criteria Weights using AHP and Fuzzy-AHP', short: 'Criteria Weights using AHP and Fuzzy-AHP', status: 'wip', svg: ahpSvg(),
      text: 'Nine-point AHP pairwise comparisons from expert surveys or FGDs in SuperDecisions, accepted when the consistency ratio is ≤ 0.10. Fuzzy-AHP is also explored.',
      time: 'Sep 2026 – Mar 2027 · Criteria list and weights',
      people: 'Marcial S. Buladaco II (Study Leader) · Jessabel B. Magtoltol (Project Staff)',
      purpose: [
        'Not all criteria affect land suitability equally. Study 4 will weight the climatic, soil, topographic and land cover criteria and their sub-criteria, so that the overlay in Study 5 reflects each factor’s relative importance for each crop.',
        'The Analytic Hierarchy Process (AHP) is the most widely used multi-criteria decision analysis method in land suitability studies. Fuzzy-AHP extends it to handle uncertainty in expert judgements.'
      ],
      methods: [
        'Identify and select criteria and sub-criteria from the Study 1 compendium and the layers produced in Studies 2 and 3.',
        'Build a 9-point scale AHP hierarchical model (Saaty, 1980).',
        'Collect pairwise comparisons from experts through a survey or focus group discussion, and compute weights in SuperDecisions.',
        'Check each comparison matrix with the consistency ratio (CR). Accept it when CR ≤ 0.10; otherwise revise the comparisons.',
        'Explore Fuzzy-AHP and compare its weights with conventional AHP.'
      ],
      schedule: [
        ['Identification and selection of criteria and sub-criteria', 'Sep – Oct 2026', 'List of criteria and sub-criteria for suitability analysis'],
        ['Derivation of weights/priorities of the selected criteria', 'Nov 2026 – Mar 2027', 'Weights of the criteria and sub-criteria']
      ],
      output: 'Derived weights and priorities of the land characteristics using MCDA methods.' },
    { n: 5, title: 'GIS-based Suitability Analysis of Selected Crops', short: 'GIS-based Suitability Analysis', status: 'wip', svg: reclassSvg(),
      text: 'Criteria rasters reclassified 1–5 (N2 to S1) and combined by weighted overlay in ArcGIS Pro ModelBuilder to produce actual and potential suitability maps, with recommendations for limitations.',
      time: 'Mar – Dec 2027 · Suitability models, reclassified rasters, maps',
      people: 'Marcial S. Buladaco II (Study Leader) · Sophia Alelie C. Bugia (Project Staff)',
      purpose: [
        'Study 5 brings every layer together. It produces actual and potential land suitability maps for the 17 major crops at the provincial level, identifies the factors that limit suitability, and recommends ways to address them.'
      ],
      methods: [
        'Convert feature data to raster format.',
        'Reclassify each criterion into five classes using the Study 1 thresholds: 5 for S1 (highly suitable) down to 1 for N2 (permanently not suitable).',
        'Build a suitability model for each crop in ArcGIS Pro ModelBuilder to automate the workflow.',
        'Combine the reclassified layers with the Study 4 weights by weighted sum or weighted overlay to map actual suitability.',
        'Identify limiting factors, recommend improvements, and map potential suitability where addressing a limitation changes the class.'
      ],
      schedule: [
        ['Land use suitability model development using ArcGIS Pro ModelBuilder', 'Mar – May 2027', 'Land use suitability models'],
        ['GIS-based suitability analysis', 'Jun – Sep 2027', 'Reclassified raster layers; actual and potential suitability maps'],
        ['Result write-up', 'Sep – Dec 2027', 'Detailed report; at least one Scopus- or WoS-indexed journal article; at least one technical paper or poster at a scientific conference']
      ],
      output: 'Results of the GIS-based suitability analysis and suitability maps of the major crops.' }
  ];
  STUDIES.forEach((s) => { s.href = `study-${s.n}.html`; });
  const mediaHtml = (s) => s.img
    ? `<img src="${s.img}" alt="${esc(s.alt)}"${s.imgPos ? ` style="object-position:${s.imgPos}"` : ''}>`
    : s.svg;

  /* ================= shell: header + footer ================= */
  const CREDITS = [["Home banner","Banaue Philippines Batad-Rice-Terraces-02.jpg","https://commons.wikimedia.org/wiki/File:Banaue_Philippines_Batad-Rice-Terraces-02.jpg","CEphoto, Uwe Aranas","CC BY-SA 4.0"],["Home: project section","Banaue Philippines Banaue-Rice-Terraces-01.jpg","https://commons.wikimedia.org/wiki/File:Banaue_Philippines_Banaue-Rice-Terraces-01.jpg","CEphoto, Uwe Aranas","CC BY-SA 3.0"],["Lowland/Irrigated Rice","Rice fields bohol philippines 2017.jpg","https://commons.wikimedia.org/wiki/File:Rice_fields_bohol_philippines_2017.jpg","Øyvind Holmstad","CC BY-SA 4.0"],["Upland/Rainfed Rice","4 upland rice field.jpg","https://commons.wikimedia.org/wiki/File:4_upland_rice_field.jpg","Rosyaraur (talk)","Public domain"],["Corn/Maize","Corn in a field by Myrstigen 1.jpg","https://commons.wikimedia.org/wiki/File:Corn_in_a_field_by_Myrstigen_1.jpg","W.carter","CC BY-SA 4.0"],["Coffee","Maejantai Chiang Rai province 05.JPG","https://commons.wikimedia.org/wiki/File:Maejantai_Chiang_Rai_province_05.JPG","Takeaway","CC BY-SA 3.0"],["Cacao","Cacao Tree (Theobroma cacao) green pods (17348751253).jpg","https://commons.wikimedia.org/wiki/File:Cacao_Tree_(Theobroma_cacao)_green_pods_(17348751253).jpg","Bernard DUPONT from FRANCE","CC BY-SA 2.0"],["Coconut","Coconut forest at Villa Escudero (Tiaong, Quezon; 10-08-2022).jpg","https://commons.wikimedia.org/wiki/File:Coconut_forest_at_Villa_Escudero_(Tiaong,_Quezon;_10-08-2022).jpg","Patrickroque01","CC BY-SA 4.0"],["Sugarcane","Sugar Cane Field, Barangay Haguimit, La Carlota City - panoramio (1).jpg","https://commons.wikimedia.org/wiki/File:Sugar_Cane_Field,_Barangay_Haguimit,_La_Carlota_City_-_panoramio_(1).jpg","divina_gracia","CC BY 3.0"],["Mango","Carabao mangoes (Philippines).jpg","https://commons.wikimedia.org/wiki/File:Carabao_mangoes_(Philippines).jpg","Obsidian Soul","CC0"],["Banana","Banana Plantation Panabo City.jpg","https://commons.wikimedia.org/wiki/File:Banana_Plantation_Panabo_City.jpg","Shubert Ciencia","CC BY 2.0"],["Pineapple","Pineapple Plantation- Maraca.jpg","https://commons.wikimedia.org/wiki/File:Pineapple_Plantation-_Maraca.jpg","Daralnoble","CC BY-SA 4.0"],["Cabbage","Cabbage farm 5.jpg","https://commons.wikimedia.org/wiki/File:Cabbage_farm_5.jpg","Salihu Aliyu","CC BY-SA 4.0"],["Carrot","Carotte-Poissonerie macofish.jpg","https://commons.wikimedia.org/wiki/File:Carotte-Poissonerie_macofish.jpg","Cheikh cherif","CC BY-SA 4.0"],["Tomato","Grape tomatoes on the vine at Ljubljana Central Market.JPG","https://commons.wikimedia.org/wiki/File:Grape_tomatoes_on_the_vine_at_Ljubljana_Central_Market.JPG","domdomegg","CC BY 4.0"],["Onion","Onion harvest in Bavaria 4.jpg","https://commons.wikimedia.org/wiki/File:Onion_harvest_in_Bavaria_4.jpg","pfatter","CC BY 2.0"],["Cassava","A cassava plant in a farm adjacent to maize field.jpg","https://commons.wikimedia.org/wiki/File:A_cassava_plant_in_a_farm_adjacent_to_maize_field.jpg","McOREAL","CC BY-SA 4.0"],["Sweet Potato","Ipomoea batatas 006.JPG","https://commons.wikimedia.org/wiki/File:Ipomoea_batatas_006.JPG","Llez","CC BY-SA 3.0"],["Potato","CSIRO ScienceImage 4062 Potato plants on farm near Atherton QLD.jpg","https://commons.wikimedia.org/wiki/File:CSIRO_ScienceImage_4062_Potato_plants_on_farm_near_Atherton_QLD.jpg","Willem van Aken, CSIRO","CC BY 3.0"],["Study 1 banner","Coffee arabica cherry.jpg","https://commons.wikimedia.org/wiki/File:Coffee_arabica_cherry.jpg","Roger Burger","CC0"],["Study 2 banner","Mindanao Sentinel-2 MSI 2019 cloudless composite.jpg","https://commons.wikimedia.org/wiki/File:Mindanao_Sentinel-2_MSI_2019_cloudless_composite.jpg","Original data: ESA Copernicus Sentinel-2 Processed and compiled by EOX IT Services GmbH","Attribution"]];
  function renderShell() {
    const header = $('#site-header');
    if (header) {
      header.className = 'nav'; header.id = 'top';
      const link = (href, label, key, extra = '') =>
        `<a href="${href}"${PAGE === key ? ' class="active" aria-current="page"' : ''}${extra}>${label}</a>`;
      header.innerHTML = `<div class="nav-inner">
        <a class="brand" href="index.html" aria-label="Land Suitability PH home">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect width="32" height="32" rx="7" fill="#0f3d2e"/><path d="M6 22c5-1 8-4 10-9 2 5 5 8 10 9" stroke="#d6a21e" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M6 26h20" stroke="#3fae80" stroke-width="2.4" stroke-linecap="round"/></svg>
          <span>Land Suitability <b>PH</b></span>
        </a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="navlinks" aria-label="Open menu"><span></span><span></span><span></span></button>
        <nav id="navlinks" class="nav-links" aria-label="Site">
          ${link('index.html', 'Home', 'home')}
          ${STUDIES.map((s) => link(s.href, `<span class="nav-dot ${s.status}" aria-hidden="true"></span>Study ${s.n}`, `study-${s.n}`, ` title="${esc(STATUS[s.status])}"`)).join('')}
          ${link('index.html#team', 'Team', 'team')}
        </nav>
      </div>`;
      const toggle = $('.nav-toggle', header), links = $('#navlinks');
      toggle.addEventListener('click', () => { const open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
      links.addEventListener('click', (e) => { if (e.target.closest('a')) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } });
    }
    const footer = $('#site-footer');
    if (footer) {
      footer.className = 'footer';
      footer.innerHTML = `<div class="wrap footer-grid">
        <div>
          <p class="brand light">Land Suitability <b>PH</b></p>
          <p>Division of Soil Science, Agricultural Systems Institute, College of Agriculture and Food Science, University of the Philippines Los Baños.</p>
          <p class="small">Crop thresholds are screening-level requirements compiled from the literature. Calibrate locally with soil survey, cultivar and management data before operational use.</p>
          <p class="small footer-links">${STUDIES.map((s) => `<a href="${s.href}">Study ${s.n}</a>`).join(' · ')}</p>
        </div>
        <div>
          <details class="credits">
            <summary>Photo credits (Wikimedia Commons)</summary>
            <ul>${CREDITS.map(([lbl, title, page, artist, lic]) => `<li><b>${esc(lbl)}:</b> <a href="${esc(page)}" target="_blank" rel="noopener">${esc(title)}</a> · ${esc(artist)} · ${esc(lic)}</li>`).join('')}
              <li><b>Study 3 maps:</b> project output; basemap © Earthstar Geographics</li>
              <li><b>Team photos:</b> project team</li></ul>
          </details>
        </div>
      </div>
      <div class="wrap footer-bottom small">© 2025–2027 UPLB CAFS–ASI Division of Soil Science · <a href="#top">Back to top</a></div>`;
    }
  }
  renderShell();

  // in-page sub-navigation highlighting
  const subLinks = $$('.subnav a[href^="#"]');
  if (subLinks.length) {
    const map = new Map(subLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting && map.has(en.target.id)) { map.forEach((a) => a.classList.remove('active')); map.get(en.target.id).classList.add('active'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ================= study page header + pager ================= */
  const pageStudy = STUDIES.find((s) => `study-${s.n}` === PAGE);
  if (pageStudy && $('#page-hero')) {
    const s = pageStudy;
    document.title = `Study ${s.n}: ${s.short || s.title} · Land Suitability PH`;
    $('#page-hero').innerHTML = `<div class="wrap page-hero-grid">
      <div>
        <p class="crumbs"><a href="index.html">Home</a> <span aria-hidden="true">/</span> <a href="index.html#studies">Studies</a> <span aria-hidden="true">/</span> Study ${s.n}</p>
        <span class="badge ${s.status}"><span class="dot"></span>${STATUS[s.status]}</span>
        <p class="ph-num">Study ${s.n} of 5</p>
        <h1${s.title.length > 70 ? ' class="long"' : ''}>${esc(s.title)}</h1>
        <p class="ph-text">${esc(s.text)}</p>
        <p class="ph-meta"><span>${esc(s.people)}</span><span>${esc(s.time)}</span></p>
      </div>
      <div class="ph-media">${mediaHtml(s)}</div>
    </div>`;
    const pager = $('#study-pager');
    if (pager) {
      const prev = STUDIES[s.n - 2], next = STUDIES[s.n];
      pager.innerHTML = `<div class="wrap pager-grid">
        ${prev ? `<a class="pager prev" href="${prev.href}"><span>← Study ${prev.n}</span>${esc(prev.short || prev.title)}</a>` : '<span></span>'}
        ${next ? `<a class="pager next" href="${next.href}"><span>Study ${next.n} →</span>${esc(next.short || next.title)}</a>` : '<a class="pager next" href="index.html"><span>Home →</span>Project overview</a>'}
      </div>`;
    }
  }

  /* ================= home ================= */
  // old single-page links (index.html#compare, #crop-coffee, #climate …) now live on study pages
  if (PAGE === 'home' && location.hash) {
    const h = location.hash;
    if (/^#(crop-|compendium$|compare$|methods$|references$)/.test(h)) location.replace('study-1.html' + h);
    else if (h === '#climate') location.replace('study-3.html');
  }
  if ($('#study-grid')) {
    $('#study-grid').innerHTML = STUDIES.map((s) => `
      <article class="study ${s.status}">
        <a class="study-media" href="${s.href}" tabindex="-1" aria-hidden="true">${mediaHtml(s).replace('<img ', '<img loading="lazy" ')}
          <span class="badge ${s.status}"><span class="dot"></span>${STATUS[s.status]}</span></a>
        <div class="study-body">
          <span class="study-num">Study ${s.n}</span>
          <h3><a href="${s.href}">${esc(s.short || s.title)}</a></h3>
          <p>${esc(s.text)}</p>
          <p class="timeline"><strong>Timeline:</strong> ${esc(s.time)}</p>
          <a class="study-link" href="${s.href}">${{ done: 'View the results', partial: 'View the initial results', wip: 'See the study plan' }[s.status]} →</a>
          <p class="people">${esc(s.people)}</p>
        </div>
      </article>`).join('');
  }
  if ($('#team-grid')) {
    const TEAM = [
      ['Marcial S. Buladaco II', 'Project Leader', 'Study Leader, Studies 3–5', 'buladaco'],
      ['Nicola Louise T. Timbas', 'Study Leader', 'Study 2', 'timbas'],
      ['Jessabel B. Magtoltol', 'Study Leader', 'Study 1 · Project Staff, Studies 3–4', 'magtoltol'],
      ['Hiyasmin Rose L. Benzon', 'Co-Study Leader', 'Study 1', 'benzon'],
      ['Darryl Nelo S. Aguila', 'Project Staff', 'Study 2', 'aguila'],
      ['Sophia Alelie C. Bugia', 'Project Staff', 'Study 5', 'bugia']
    ];
    $('#team-grid').innerHTML = TEAM.map(([n, role, detail, photo]) => `
      <figure class="person">
        <div class="person-photo"><img src="assets/img/team/${photo}.jpg" alt="Portrait of ${esc(n)}" loading="lazy" width="480" height="600"></div>
        <figcaption><b>${esc(n)}</b><span class="role">${esc(role)}</span><span>${esc(detail)}</span><span class="unit">CAFS · ASI · Division of Soil Science</span></figcaption>
      </figure>`).join('');
  }

  /* ================= work-in-progress study pages (2, 4, 5) ================= */
  if (pageStudy && $('#study-plan')) {
    const s = pageStudy;
    $('#study-plan').innerHTML = `
      <section class="section">
        <div class="wrap two-col narrow-right">
          <div>
            <p class="kicker">About this study</p>
            <h2>What Study ${s.n} will do</h2>
            ${s.purpose.map((p) => `<p>${esc(p)}</p>`).join('')}
            <h3 class="sub">Planned methods</h3>
            <ol class="plan-steps">${s.methods.map((m) => `<li>${esc(m)}</li>`).join('')}</ol>
          </div>
          <aside class="notice-card" aria-label="Status">
            <span class="badge wip"><span class="dot"></span>Work in progress</span>
            <h3>Results are not yet available</h3>
            <p>This page will show Study ${s.n}’s maps, tables and discussion once the results are finalized.</p>
            <p class="small"><b>Expected output:</b> ${esc(s.output)}</p>
          </aside>
        </div>
      </section>
      <section class="section alt">
        <div class="wrap">
          <p class="kicker">Schedule</p>
          <h2>Activities and deliverables</h2>
          <div class="table-wrap"><table class="plan-table">
            <thead><tr><th>Activity</th><th>Timeline</th><th>Deliverables</th></tr></thead>
            <tbody>${s.schedule.map(([a, t, d]) => `<tr><td><b>${esc(a)}</b></td><td class="nowrap">${esc(t)}</td><td>${esc(d)}</td></tr>`).join('')}</tbody>
          </table></div>
          <p class="muted small">Source: project proposal schedule of activities (2025–2027).</p>
        </div>
      </section>`;
  }

  /* ================= Study 1 ================= */
  if (D && $('#crop-grid')) initStudy1();
  function initStudy1() {
    // crop cards
    const find = (c, names) => c.factors.find((f) => names.includes(f.factor));
    const snap = (c) => {
      const t = find(c, ['Mean annual temperature', 'Mean temperature of growing cycle']);
      const r = find(c, ['Mean annual rainfall', 'Precipitation of growing cycle']);
      const p = find(c, ['Soil pH']);
      const sl = find(c, ['Slope']);
      const row = (lbl, f, u) => f ? `<dt>${lbl}</dt><dd>${esc(f.S1)}${u ?? (f.unit && f.unit !== 'pH units' ? ' ' + esc(f.unit) : '')}</dd>` : '';
      return row('Temperature', t) + row('Rainfall', r) + row('pH', p, '') + row('Slope', sl);
    };
    let activeGroup = 'all', query = '';
    const counts = D.crops.reduce((m, c) => (m[c.group] = (m[c.group] || 0) + 1, m), {});
    $('#group-chips').innerHTML = Object.entries(GROUPS).map(([k, v]) =>
      `<button type="button" class="chip" data-g="${k}" aria-pressed="${k === 'all'}">${v}<span class="n">${k === 'all' ? D.crops.length : counts[k]}</span></button>`).join('');
    $('#group-chips').addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      activeGroup = b.dataset.g;
      $$('.chip', $('#group-chips')).forEach((x) => x.setAttribute('aria-pressed', x === b));
      renderCrops();
    });
    $('#crop-search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderCrops(); });
    function renderCrops() {
      const list = D.crops.filter((c) => (activeGroup === 'all' || c.group === activeGroup) &&
        (!query || (c.name + ' ' + c.sci + ' ' + c.group).toLowerCase().includes(query)));
      $('#crop-grid').innerHTML = list.length ? list.map((c) => `
        <button type="button" class="crop-card" data-id="${c.id}" aria-label="Open requirements for ${esc(c.name)}">
          <div class="ph"><img src="${c.img}" alt="" loading="lazy"><span class="pill">${GROUP_SHORT[c.group]}</span></div>
          <div class="cb">
            <h3>${esc(c.name)}</h3>
            <span class="sci">${esc(c.sci)}</span>
            <dl class="snap">${snap(c)}</dl>
            <span class="more">${c.factors.length} factors · view S1–N2 table →</span>
          </div>
        </button>`).join('') : '<p class="empty">No crops match your search.</p>';
    }
    renderCrops();
    $('#crop-grid').addEventListener('click', (e) => { const b = e.target.closest('.crop-card'); if (b) openCrop(b.dataset.id); });

    // crop dialog
    const dlg = $('#crop-dialog');
    const leadBold = (p) => {
      const m = p.match(/^([^.]{3,80}\.)\s(.*)$/s);
      return m ? `<p><b>${esc(m[1])}</b> ${esc(m[2])}</p>` : `<p>${esc(p)}</p>`;
    };
    function openCrop(id) {
      const c = D.crops.find((x) => x.id === id); if (!c) return;
      $('#dlg-img').src = c.img; $('#dlg-img').alt = c.name;
      $('#dlg-title').textContent = c.name;
      $('#dlg-sci').textContent = c.sci;
      $('#dlg-group').textContent = GROUPS[c.group];
      const rows = c.factors.map((f, i) => `
        <tr>
          <td class="factor">${esc(f.factor)}<small>${esc(f.unit)}${f.type ? ' · ' + esc(f.type) : ''}</small>
            <button type="button" class="note-btn" aria-expanded="false" data-row="${i}">Notes &amp; sources</button></td>
          ${CLASSES.map((k) => { const v = f[k]; return `<td class="v ${k} ${isND(v) ? 'isnd' : ''}">${isND(v) ? '<span class="nd">ND</span>' : esc(v)}</td>`; }).join('')}
        </tr>
        <tr class="notes-row" data-for="${i}" hidden><td colspan="6"><p><b>Principal source(s):</b> ${esc(f.source)}</p>${f.notes ? `<p><b>Compiler’s notes:</b> ${esc(f.notes)}</p>` : ''}</td></tr>`).join('');
      $('#tab-req').innerHTML = `
        <div class="panel-actions">
          <p class="muted small" style="margin:0">Explicit, non-overlapping class intervals. <span class="nd">ND</span> = not differentiated or not defined by the cited source.</p>
          <button type="button" class="btn btn-outline" id="dl-crop">Download CSV</button>
        </div>
        <div class="table-wrap"><table class="req-table">
          <thead><tr><th>Land characteristic</th>${CLASSES.map((k) => `<th class="cls"><i class="c-${k}">${k === 'N1' ? 'N1 / N' : k}</i></th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody></table></div>`;
      $('#tab-sum').innerHTML = c.summary.map(leadBold).join('');
      $('#tab-disc').innerHTML = `<div class="disc">${c.discussion.map(leadBold).join('')}</div>`;
      selectTab('t-req');
      $('#dl-crop').addEventListener('click', () => downloadRows(`${c.id}_requirements.csv`,
        ['Crop', 'Scientific name', 'Factor', 'Unit', 'Limitation type', 'S1', 'S2', 'S3', 'N1 / N', 'N2', 'Principal source(s)', 'Notes'],
        c.factors.map((f) => [c.name, c.sci, f.factor, f.unit, f.type, f.S1, f.S2, f.S3, f.N1, f.N2, f.source, f.notes])));
      $$('.note-btn', $('#tab-req')).forEach((b) => b.addEventListener('click', () => {
        const r = $(`tr[data-for="${b.dataset.row}"]`, $('#tab-req'));
        r.hidden = !r.hidden; b.setAttribute('aria-expanded', !r.hidden);
        b.textContent = r.hidden ? 'Notes & sources' : 'Hide notes';
      }));
      $('.dlg-body', dlg).scrollTop = 0;
      if (!dlg.open) dlg.showModal();
      history.replaceState(null, '', '#crop-' + id);
    }
    dlg.addEventListener('close', () => { if (location.hash.startsWith('#crop-')) history.replaceState(null, '', '#compendium'); });
    $('#dlg-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    const tabs = $$('[role="tab"]', dlg);
    function selectTab(id) {
      tabs.forEach((t) => {
        const on = t.id === id;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => selectTab(t.id));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(n.id); n.focus();
      });
    });
    if (location.hash.startsWith('#crop-')) openCrop(location.hash.slice(6));
    addEventListener('hashchange', () => { if (location.hash.startsWith('#crop-')) openCrop(location.hash.slice(6)); });

    // compare chart
    const NUMERIC_FACTORS = [
      'Soil pH', 'Mean annual temperature', 'Mean temperature of growing cycle', 'Mean annual rainfall', 'Precipitation of growing cycle',
      'Dry season length', 'Effective soil depth', 'Slope', 'Organic carbon', 'CEC (effective)', 'Base saturation', 'Electrical conductivity (salinity)'
    ];
    const fSel = $('#factor-select'), sSel = $('#sort-select');
    fSel.innerHTML = NUMERIC_FACTORS.map((f) => {
      const n = D.crops.filter((c) => c.factors.some((x) => x.factor === f)).length;
      return `<option value="${esc(f)}">${esc(f)} (${n} crops)</option>`;
    }).join('');
    let view = 'chart';
    $$('#compare .seg button').forEach((b) => b.addEventListener('click', () => {
      view = b.dataset.view;
      $$('#compare .seg button').forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
      $('#chart').hidden = view !== 'chart'; $('#chart-table').hidden = view !== 'table';
      $('.chart-head .legend').style.visibility = view === 'chart' ? 'visible' : 'hidden';
      renderCompare();
    }));
    fSel.addEventListener('change', renderCompare);
    sSel.addEventListener('change', renderCompare);

    function compareRows() {
      const fname = fSel.value;
      const rows = D.crops.map((c) => {
        const f = c.factors.find((x) => x.factor === fname);
        if (!f) return { c, f: null };
        const scale = (fname === 'Organic carbon' && /g\/kg/i.test(f.unit)) ? 0.1 : 1;
        const cls = {};
        CLASSES.forEach((k) => { const p = parseInterval(f[k]); cls[k] = p ? p.map(([a, b]) => [a * scale, b * scale]) : null; });
        return { c, f, cls, scale };
      });
      const s1mid = (r) => {
        if (!r.cls || !r.cls.S1) return Infinity;
        const fin = r.cls.S1.flat().filter(Number.isFinite); return fin.length ? fin.reduce((a, b) => a + b, 0) / fin.length : Infinity;
      };
      if (sSel.value === 's1') rows.sort((a, b) => s1mid(a) - s1mid(b));
      if (sSel.value === 'name') rows.sort((a, b) => a.c.name.localeCompare(b.c.name));
      return rows;
    }
    function showTip(r, x, y) {
      if (!r.f) tip.innerHTML = `<b>${esc(r.c.name)}</b>Not assessed for this factor.`;
      else {
        tip.innerHTML = `<b>${esc(r.c.name)}</b><span style="opacity:.75">${esc(r.f.unit)}${r.scale !== 1 ? ' (shown as %)' : ''}</span>` +
          CLASSES.map((k) => `<div class="tr"><i class="c-${k}">${k}</i><span>${isND(r.f[k]) ? 'ND' : esc(r.f[k])}</span></div>`).join('');
      }
      placeTip(x, y);
    }
    function renderCompare() {
      const fname = fSel.value;
      const rows = compareRows();
      const withData = rows.filter((r) => r.f);
      const units = [...new Set(withData.map((r) => r.scale !== 1 ? '%' : r.f.unit))];
      $('#chart-title').textContent = fname;
      $('#chart-sub').textContent = `${units.join(' / ')} · ${withData.length} of ${rows.length} crops assessed`;
      const notes = [];
      if (rows.some((r) => r.scale && r.scale !== 1)) notes.push('Organic carbon reported in g/kg was converted to % for comparison.');
      if (units.length > 1) notes.push('Sources report this factor on different temporal bases; compare within the same unit.');
      if (withData.some((r) => CLASSES.some((k) => !isND(r.f[k]) && !r.cls[k]))) notes.push('Classes with non-numeric criteria are listed in the tooltip but not drawn.');
      notes.push('Open-ended classes (e.g., “≥100” or “<5”) run to the edge of the axis.');
      $('#chart-note').textContent = notes.join(' ');

      if (view === 'table') {
        $('#chart-table').innerHTML = `<table><thead><tr><th>Crop</th><th>Unit</th>${CLASSES.map((k) => `<th><i class="c-${k}">${k === 'N1' ? 'N1 / N' : k}</i></th>`).join('')}</tr></thead><tbody>` +
          rows.map((r) => `<tr><td><b>${esc(r.c.name)}</b></td><td>${r.f ? esc(r.f.unit) : ''}</td>${CLASSES.map((k) => `<td class="num">${!r.f ? '<span class="muted">—</span>' : isND(r.f[k]) ? '<span class="nd">ND</span>' : esc(r.f[k])}</td>`).join('')}</tr>`).join('') + '</tbody></table>';
        return;
      }
      const vals = withData.flatMap((r) => CLASSES.flatMap((k) => (r.cls[k] || []).flat())).filter(Number.isFinite);
      let lo = Math.min(...vals), hi = Math.max(...vals);
      const pad = (hi - lo) * 0.06 || 1;
      lo = Math.max(lo - pad, Math.min(...vals) >= 0 ? 0 : -Infinity); hi = hi + pad;
      const box = $('#chart'); const W = Math.max(320, box.clientWidth);
      const narrow = W < 560;
      const LBL = narrow ? 98 : 150, R = 16, ROW = 30, BAR = 16, TOP = 8, AX = 28;
      const grouped = sSel.value === 'group';
      const items = []; let y = TOP, lastG = null;
      rows.forEach((r) => {
        if (grouped && r.c.group !== lastG) { items.push({ g: r.c.group, y: y + 14 }); y += 22; lastG = r.c.group; }
        items.push({ r, y }); y += ROW;
      });
      const H = y + AX;
      const x = (v) => LBL + (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo) * (W - LBL - R);
      const ticks = niceTicks(lo, hi, narrow ? 4 : 8);
      let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Range chart of ${esc(fname)} suitability classes by crop">`;
      svg += `<g class="grid">${ticks.map((t) => `<line x1="${x(t)}" x2="${x(t)}" y1="${TOP}" y2="${H - AX}"/>`).join('')}</g>`;
      svg += `<g class="axis">${ticks.map((t) => `<text x="${x(t)}" y="${H - AX + 16}" text-anchor="middle">${fmt(t)}</text>`).join('')}</g>`;
      items.forEach((it, idx) => {
        if (it.g) { svg += `<text class="grp-label" x="0" y="${it.y}">${esc(GROUP_SHORT[it.g])}</text>`; return; }
        const { r } = it; const cy = it.y + ROW / 2;
        const label = narrow ? r.c.short : r.c.name;
        svg += `<g class="row" data-i="${idx}"><rect class="row-bg" x="0" y="${it.y}" width="${W}" height="${ROW}" rx="6" fill="transparent"/>`;
        svg += `<text class="row-label ${r.f ? '' : 'dim'}" x="${narrow ? 0 : 4}" y="${cy + 4}">${esc(label.length > 22 && !narrow ? label.slice(0, 21) + '…' : label)}</text>`;
        if (!r.f) svg += `<text class="na" x="${LBL}" y="${cy + 4}">not assessed</text>`;
        else {
          let drawn = 0;
          CLASSES.forEach((k) => (r.cls[k] || []).forEach(([a, b]) => {
            let x0 = x(a), x1 = x(b);
            if (x1 - x0 < 4) { const m = (x0 + x1) / 2; x0 = m - 2; x1 = m + 2; }
            drawn++;
            svg += `<rect x="${x0 + 1}" y="${cy - BAR / 2}" width="${Math.max(2, x1 - x0 - 2)}" height="${BAR}" rx="4" fill="var(--${k})"/>`;
          }));
          if (!drawn) svg += `<text class="na" x="${LBL}" y="${cy + 4}">categorical criteria only</text>`;
        }
        svg += `<rect class="hit" x="0" y="${it.y}" width="${W}" height="${ROW}"/></g>`;
      });
      box.innerHTML = svg + '</svg>';
      $$('.row', box).forEach((g) => {
        const it = items[+g.dataset.i];
        g.addEventListener('mousemove', (e) => showTip(it.r, e.clientX, e.clientY));
        g.addEventListener('mouseleave', hideTip);
        g.addEventListener('click', (e) => { $$('.row', box).forEach((o) => o.classList.toggle('hl', o === g)); showTip(it.r, e.clientX, e.clientY); });
      });
    }
    $('.chart-head .legend').innerHTML = CLASSES.map((k) => `<li><i class="c-${k}">${k}</i></li>`).join('');
    renderCompare();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { hideTip(); renderCompare(); }, 120); });

    // references
    const refs = D.references;
    function renderRefs(q) {
      const re = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null;
      const list = refs.filter((r) => !q || (r.text + ' ' + (r.url || '')).toLowerCase().includes(q.toLowerCase()));
      $('#ref-list').innerHTML = list.map((r) => {
        let t = esc(r.text); if (re) t = t.replace(re, (m) => `<mark>${m}</mark>`);
        return `<li>${t}${r.url ? ` <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url.replace(/^https?:\/\//, '').slice(0, 60))}${r.url.length > 68 ? '…' : ''}</a>` : ''}</li>`;
      }).join('');
      $('#ref-count').textContent = q ? `${list.length} of ${refs.length} references match` : `${refs.length} references cited across the compendium`;
    }
    renderRefs('');
    $('#ref-search').addEventListener('input', (e) => renderRefs(e.target.value.trim()));
    if ($('#stat-refs')) $('#stat-refs').textContent = refs.length;
  }

  /* ================= Study 3 ================= */
  if (window.STUDY3 && $('#s3-table')) initStudy3(window.STUDY3);
  function initStudy3(S3) {
    let cur = 'precip', sortKey = 2, sortDir = 1;
    const fmtN = (v, d) => (v == null ? '<span class="muted">—</span>' :
      (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
    const fmtPlain = (v, d) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    const isGeo = (fam) => S3.geostatistical.includes(fam);

    function render() {
      const V = S3.variables[cur];
      const no = cur === 'precip' ? 1 : 2;
      $('#s3-title').textContent = V.label;
      $('#s3-map').src = V.map; $('#s3-map').alt = V.mapAlt;
      $('#s3-map-cap').innerHTML = `<b>Figure ${no}.</b> ${esc(V.mapCaption)}`;
      $('#s3-highlights').innerHTML = V.highlights.map((h) => `<li>${esc(h)}</li>`).join('');
      $('#s3-table-title').textContent = `Table ${no}. ${V.tableCaption.replace(/\.$/, '')}`;
      renderTable(V); renderChart(V);
    }
    function renderTable(V) {
      const rows = V.rows.slice().sort((a, b) => {
        const x = a[sortKey], y = b[sortKey];
        if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1;
        return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir;
      });
      const colIdx = [0, 2, 3, 4, 5, 6, 7, 8, 9];
      const head = S3.columns.map(([lbl, full], i) => {
        const k = colIdx[i], active = k === sortKey;
        return `<th scope="col" class="${i ? 'num' : ''}" aria-sort="${active ? (sortDir > 0 ? 'ascending' : 'descending') : 'none'}">
          <button type="button" data-k="${k}" title="${esc(full || lbl)}">${esc(lbl)}${active ? (sortDir > 0 ? ' ▲' : ' ▼') : ''}</button></th>`;
      }).join('');
      const d = V.decimals;
      const body = rows.map((r) => `<tr class="${r[2] === 1 ? 'best' : ''}">
          <td><span class="fam ${isGeo(r[1]) ? 'geo' : 'det'}" title="${esc(S3.families[r[1]])}">${esc(r[1])}</span>${esc(r[0])}${r[2] === 1 ? ' <span class="best-tag">Best</span>' : ''}</td>
          <td class="num">${r[2]}</td>
          ${[3, 4, 5, 6, 7, 8].map((k) => `<td class="num">${fmtN(r[k], d)}</td>`).join('')}
          <td class="num ${r[9] < 0 ? 'neg' : ''}">${fmtN(r[9], d)}</td>
        </tr>`).join('');
      $('#s3-table').innerHTML = `<caption class="sr-only">${esc(V.tableCaption)}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
      $$('#s3-table th button').forEach((b) => b.addEventListener('click', () => {
        const k = +b.dataset.k;
        sortDir = k === sortKey ? -sortDir : 1; sortKey = k; renderTable(V);
      }));
    }
    function renderChart(V) {
      const box = $('#s3-chart');
      const rows = V.rows.slice().sort((a, b) => a[2] - b[2]);
      const W = Math.max(280, box.clientWidth), narrow = W < 460;
      const LBL = narrow ? 136 : 200, R = 14, ROW = 22, TOP = 6, AX = 24;
      const H = TOP + rows.length * ROW + AX;
      const vals = rows.map((r) => r[3]);
      const span = Math.max(...vals) - Math.min(...vals);
      const lo = Math.min(...vals) - span * 0.08, hi = Math.max(...vals) + span * 0.08;
      const x = (v) => LBL + (v - lo) / (hi - lo) * (W - LBL - R);
      const ticks = niceTicks(lo, hi, narrow ? 3 : 5);
      const short = (s) => s.replace('Empirical Bayesian Kriging', 'EBK').replace('Ordinary Kriging', 'OK').replace('Radial Basis Functions', 'RBF')
        .replace('Inverse Distance Weighted', 'IDW').replace('Global Polynomial Interpolation', 'GPI').replace('Completely regularized spline', 'Compl. reg. spline')
        .replace('Inverse multiquadric', 'Inv. multiquadric').replace(' order', '');
      let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Dot chart of RMSE for 14 interpolation methods, ${esc(V.label)}">`;
      svg += `<g class="grid">${ticks.map((t) => `<line x1="${x(t)}" x2="${x(t)}" y1="${TOP}" y2="${H - AX}"/>`).join('')}</g>`;
      svg += `<g class="axis">${ticks.map((t) => `<text x="${x(t)}" y="${H - AX + 15}" text-anchor="middle">${fmt(t)}</text>`).join('')}</g>`;
      rows.forEach((r, i) => {
        const cy = TOP + i * ROW + ROW / 2, best = r[2] === 1;
        svg += `<g class="row" data-i="${i}"><rect class="row-bg" x="0" y="${cy - ROW / 2}" width="${W}" height="${ROW}" rx="5" fill="transparent"/>`;
        svg += `<text class="row-label${best ? ' strong' : ''}" x="0" y="${cy + 4}">${esc(short(r[0]))}</text>`;
        svg += `<line class="stem" x1="${LBL}" x2="${x(r[3])}" y1="${cy}" y2="${cy}"/>`;
        svg += `<circle cx="${x(r[3])}" cy="${cy}" r="${best ? 6 : 5}" class="${isGeo(r[1]) ? 'geo' : 'det'}"/>`;
        if (best) svg += `<text class="val" x="${x(r[3]) + 10}" y="${cy + 4}">${fmtPlain(r[3], V.decimals)} ${esc(V.unit)}</text>`;
        svg += `<rect class="hit" x="0" y="${cy - ROW / 2}" width="${W}" height="${ROW}"/></g>`;
      });
      box.innerHTML = svg + '</svg>';
      $$('.row', box).forEach((g) => {
        const r = rows[+g.dataset.i];
        const show = (e) => {
          tip.innerHTML = `<b>${esc(r[0])}</b><span style="opacity:.75">${esc(S3.families[r[1]])} · rank ${r[2]}</span>` +
            `<div class="kv"><span>RMSE</span><span>${fmtPlain(r[3], V.decimals)} ${esc(V.unit)}</span></div>` +
            `<div class="kv"><span>Mean error</span><span>${fmtPlain(r[4], V.decimals)}</span></div>` +
            (r[6] != null ? `<div class="kv"><span>RMSSE</span><span>${fmtPlain(r[6], V.decimals)}</span></div>` : '') +
            `<div class="kv"><span>Error reduction</span><span>${fmtPlain(r[9], 2)}%</span></div>`;
          placeTip(e.clientX, e.clientY);
        };
        g.addEventListener('mousemove', show);
        g.addEventListener('mouseleave', hideTip);
        g.addEventListener('click', (e) => { $$('.row', box).forEach((o) => o.classList.toggle('hl', o === g)); show(e); });
      });
    }
    function renderFit() {
      if (!D || !$('#s3-fit')) return;
      const T = [25.395, 28.713], P = [1033.913, 4115.463];
      const judge = (f, rng) => {
        if (!f) return { cls: 'na', txt: 'Not assessed' };
        if (/growing cycle/i.test(f.factor)) return { cls: 'na', txt: 'Growing-cycle criterion' };
        const p = parseInterval(f.S1); if (!p) return { cls: 'na', txt: 'Not numeric' };
        const a = Math.min(...p.map((s) => s[0])), b = Math.max(...p.map((s) => s[1]));
        if (b < rng[0]) return { cls: 'bad', txt: 'Below range' };
        if (a > rng[1]) return { cls: 'bad', txt: 'Above range' };
        if (a <= rng[0] && b >= rng[1]) return { cls: 'ok', txt: 'Covers whole range' };
        if (a >= rng[0] && b <= rng[1]) return { cls: 'ok', txt: 'Inside range' };
        return { cls: 'part', txt: 'Partly overlaps' };
      };
      const icon = { ok: '✓', part: '◐', bad: '✕', na: '–' };
      const cell = (j) => `<span class="fit ${j.cls}"><span aria-hidden="true">${icon[j.cls]}</span> ${j.txt}</span>`;
      $('#s3-fit').innerHTML = `<thead><tr><th>Crop</th><th>S1 temperature</th><th>vs 25.4–28.7 °C</th><th>S1 rainfall</th><th>vs 1,034–4,115 mm</th></tr></thead><tbody>` +
        D.crops.map((c) => {
          const t = c.factors.find((f) => /temperature/i.test(f.factor));
          const r = c.factors.find((f) => /rainfall|precipitation/i.test(f.factor));
          return `<tr><td><b><a href="study-1.html#crop-${c.id}">${esc(c.name)}</a></b></td>
            <td class="num">${t ? esc(t.S1) + ' ' + esc(t.unit) : '—'}</td><td>${cell(judge(t, T))}</td>
            <td class="num">${r ? esc(r.S1) + ' ' + esc(r.unit) : '—'}</td><td>${cell(judge(r, P))}</td></tr>`;
        }).join('') + '</tbody>';
    }
    $$('#s3-var button').forEach((b) => b.addEventListener('click', () => {
      cur = b.dataset.var; sortKey = 2; sortDir = 1;
      $$('#s3-var button').forEach((x) => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
      render();
    }));
    $('#s3-dl').addEventListener('click', () => {
      const V = S3.variables[cur];
      downloadRows(`study3_${cur === 'precip' ? 'annual_precipitation' : 'mean_temperature'}_interpolation_errors.csv`,
        ['Model description', 'Family', 'Rank', 'RMSE', 'Mean error', 'Mean standardized error', 'Root mean square standardized error', 'Average standard error', 'Maximum absolute error', 'Percent error reduction'],
        V.rows);
    });
    const mdlg = $('#map-dialog');
    $('#s3-map-btn').addEventListener('click', () => { $('#map-big').src = $('#s3-map').src; $('#map-big').alt = $('#s3-map').alt; mdlg.showModal(); });
    $('#map-close').addEventListener('click', () => mdlg.close());
    mdlg.addEventListener('click', (e) => { if (e.target === mdlg) mdlg.close(); });
    let rt3; addEventListener('resize', () => { clearTimeout(rt3); rt3 = setTimeout(() => { hideTip(); renderChart(S3.variables[cur]); }, 140); });
    render(); renderFit();
  }
})();
