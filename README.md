# observable-press
An opinionated way to publish Observable notebooks.

The core idea is to do all your coding in your notebook, write an HTML skeleton for its presentation, and let `observable-press` glue it all together.

## Goals
- Declarative
- No (or at least minimal) code outside of notebook
- Good defaults, minimal config
- Hide Observable machinery, but cite source
- Add minimal additional weight

## How To

1. Write an Observable notebook with named cells
2. Write an HTML/CSS skeleton for the content, using `data-cell` attributes to connect HTML nodes to Observable notebook cells
3. observable-press populates your HTML

## Examples
To run the examples, clone the repository, and serve the files locally (for example, run `python -m http.server` from the root and then load http://0.0.0.0:8000/examples/trumpbits/).

## observablehq.press
This library powers observablehq.press, which is a simple wrapper that takes a notebook and attempts to render a single cell full screen.

For example, check out [this Observable notebook](https://observablehq.com/@zzzev/slit-scan-effect) and then its [presentation on observablehq.press](https://observablehq.press/@zzzev/slit-scan-effect).

You can try it by viewing a notebook on observablehq.com and changing the `.com` to `.press` -- if it doesn't work as you'd expect, please file an issue against this repository with a link to the notebook in question.

## Known Issues
If your notebook has special CORS access rules set up (e.g. [this one](https://observablehq.com/@tezzutezzu/world-history-timeline) using Google Sheets), it probably won't work if rehosted on a different domain.
