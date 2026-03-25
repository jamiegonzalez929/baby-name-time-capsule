# Baby Name Time Capsule

Baby Name Time Capsule is a small static site for comparing U.S. baby-name popularity across two different years. It uses a bundled historical dataset, so the project runs locally with no API keys, no build system, and no runtime network dependency.

## Why It Exists

I wanted a lightweight personal data visualization that feels more like flipping through an old family scrapbook than using a dashboard. The project makes it easy to compare eras, see which names stuck around, and notice when a name had an unusually long run in the top 10.

## Features

- Compare any two years in the bundled dataset
- Switch between girls' and boys' historical rankings
- See the top 15 names for the focus year with share-of-birth percentages
- View a movement chart showing how the top 10 changed between two years
- Inspect longest continuous top-10 streaks by sex
- Rebuild the bundled JSON data locally from the raw CSV mirror
- Publish cleanly as a static GitHub Pages site

## Data Source

The bundled data is generated from the public CSV mirror at `hadley/data-baby-names`, which republishes U.S. Social Security Administration national baby-name data in a convenient flat file format.

Source URL:

`https://raw.githubusercontent.com/hadley/data-baby-names/master/baby-names.csv`

The mirrored dataset included here spans 1880 through 2008. That limitation is called out in the UI and docs.

## Project Structure

- `index.html`: static app shell
- `styles.css`: visual design and layout
- `app.js`: client-side comparison logic and rendering
- `scripts/build_data.py`: downloads/processes the source CSV into a compact JSON bundle
- `data/baby-name-time-capsule.json`: generated site data
- `tests/test_build_data.py`: automated tests for the data pipeline
- `docs/data.md`: notes on the dataset and transformation choices

## Setup

Requirements:

- Python 3.9+

Optional tools used during publishing:

- `gh` for GitHub repo creation and Pages setup

## How To Run

Serve the repo root with any static file server. The simplest built-in option is:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## How To Test

Run the automated test suite:

```bash
python3 -m unittest discover -s tests -v
```

Optional quick verification commands used during development:

```bash
python3 -m json.tool data/baby-name-time-capsule.json >/dev/null
node --check app.js
```

## Rebuild The Data Bundle

The repo already includes the generated JSON bundle, but you can rebuild it locally:

```bash
python3 scripts/build_data.py --download
```

That command refreshes:

- `data/raw-baby-names.csv`
- `data/baby-name-time-capsule.json`

## Example Usage

1. Open the site locally.
2. Choose `Girls` or `Boys`.
3. Set a focus year such as `2008`.
4. Set a comparison year such as `1968`.
5. Inspect the top-name list, movement chart, and streak board.

Example questions this project answers well:

- Which names survived in the top 25 across four decades?
- How concentrated were top girls' names in the 1880s versus the 2000s?
- Which names had unusually long top-10 runs?

## Limitations

- The mirrored source dataset in this repo currently ends at 2008.
- The site intentionally focuses on top-name rankings rather than arbitrary full-text name search.
- The movement view is limited to names that reached the top 10 in either selected year.

## Next Ideas

- Add decade presets and shareable URL parameters
- Add a downloadable CSV export for the current comparison
- Add a small annotation layer for historically notable naming shifts
