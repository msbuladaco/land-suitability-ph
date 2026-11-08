# Land Suitability PH

**Development of land use suitability models using integrated MCDA, GIS, and RS approach for major crops in the Philippines**

Division of Soil Science · Agricultural Systems Institute · College of Agriculture and Food Science · University of the Philippines Los Baños (2025–2027)

This repository hosts the project showcase website. It currently publishes the results of **Study 1: Compendium of Land Utilization Type Requirements**: FAO suitability class thresholds (S1, S2, S3, N1, N2) for 17 major crops. It also presents the initial results of **Study 3**: interpolated annual precipitation and mean temperature surfaces, with a cross-validation comparison of 14 interpolation methods. Studies 2, 4 and 5 are in progress.

## Website features

The site has a home page plus one page per study:

| Page | Content |
|---|---|
| `index.html` | Project overview, objectives, how the studies connect, study cards, team |
| `study-1.html` | Crop compendium, cross-crop comparison, methods, references |
| `study-2.html` | Study plan and schedule (work in progress) |
| `study-3.html` | Interpolated climate surfaces, error tables, scientific discussion |
| `study-4.html` | Study plan and schedule (work in progress) |
| `study-5.html` | Study plan and schedule (work in progress) |

- **Crop compendium**: 17 crop profiles (lowland and upland rice, corn, coffee, cacao, coconut, sugarcane, mango, banana, pineapple, cabbage, carrot, tomato, onion, cassava, sweet potato, potato). Each profile has its S1–N2 requirement table, compiler notes and sources, a summary, and the full technical discussion.
- **Cross-crop comparison**: an interactive range chart, with a table view, for pH, temperature, rainfall, soil depth, slope, organic carbon, CEC, base saturation, salinity and dry-season length.
- **Study 3 climate surfaces**: EBK maps of annual precipitation and mean temperature, recreated cross-validation tables (sortable, downloadable), an RMSE chart, a scientific discussion, and a check of each crop's S1 climate range against the interpolated ranges.
- **Downloads**: all 173 crop–factor records as CSV, plus a CSV for each crop and for each Study 3 error table.
- **Project overview**: objectives, how the five studies connect, status of each study, the team, and 74 searchable references.

## Structure

```
docs/                       ← GitHub Pages root
├── index.html              ← home
├── study-1.html … study-5.html
└── assets/
    ├── css/style.css
    ├── js/app.js           ← shared header/footer, study list, page modules
    ├── js/data.js          ← compendium data (generated from Study 1 outputs)
    ├── js/study3.js        ← Study 3 error tables (re-typed from the progress report)
    ├── data/crop_requirements_17_crops.csv
    └── img/                ← photos from Wikimedia Commons (credits in site footer)
```

## Publish on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then pick `main` and the `/docs` folder.
3. The site will be live at `https://<username>.github.io/<repository>/`.

## Run locally

```bash
python -m http.server 8000 --directory docs
```

Then open http://localhost:8000. You can also open `docs/index.html` directly in a browser, since the site needs no build step.

## Data sources

The site data comes from the Study 1 outputs:
`Final_Crop_Suitability_Tables_17_Crops.docx`, `Final_Crop_Suitability_17_Crops_Comprehensive_Discussion.docx`, and `Crop_Requirements_All17Crops_MultiSourced.xlsx`.

The thresholds are screening-level crop requirements compiled from the literature. Calibrate them locally with soil survey, cultivar and management data before operational use.

## Image credits

All photographs come from Wikimedia Commons under CC BY, CC BY-SA, CC0 or public-domain licenses. The site footer lists each author and license.
