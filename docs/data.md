# Data Notes

## Source

This project uses the public CSV mirror from:

`https://raw.githubusercontent.com/hadley/data-baby-names/master/baby-names.csv`

That repository republishes U.S. Social Security Administration national baby-name data in a single CSV with these columns:

- `year`
- `name`
- `percent`
- `sex`

## Why This Source

The official SSA distribution endpoint was not suitable for a fast unattended local build in this run, while this mirror is easy to download directly and still preserves the underlying historical dataset. The project bundles the generated output, so the app itself does not depend on the network once the repo is cloned.

## Transformation

`scripts/build_data.py` performs three steps:

1. Download the raw CSV into `data/raw-baby-names.csv`
2. Rank names within each year and sex, keeping the top 25
3. Compute longest continuous top-10 streaks for each sex

The resulting JSON file is intentionally compact so it can load quickly on GitHub Pages and local static servers.

## Output Shape

The generated JSON contains:

- source metadata
- generation timestamp
- year range
- `top_by_year`
- `streaks`

The site uses only the generated JSON. It never reads the raw CSV in the browser.

## Important Limitation

The mirrored dataset bundled for this project runs from 1880 through 2008. The README and interface both state that clearly so the project does not imply coverage beyond the actual source.
