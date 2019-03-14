# observable-press
An opinionated way to publish [Observable notebooks](//observablehq.com).

The core idea is to do all your coding in your notebook, write an HTML skeleton for its presentation, and let `observable-press` glue it all together.

The [Observable Runtime](https://github.com/observablehq/runtime) makes this pretty easy to do with no library, but `observable-press` adds a consistent pattern that allows you to write zero code outside your notebook, and also adds some small conveniences (initial loading indicator, new `height` builtin).

This project is not affiliated or endorsed by Observable, Inc.

## How To

1. Write an Observable notebook with named cells
2. Write an HTML/CSS skeleton for the content, and put the contents of `src` in the same directory (`style.css` is optional)
3. Add `data-cell="cellName"` attributes to HTML tags you'd like to be populated from the notebook (note: cells using `viewof` must have the attribute value `"viewof cellName"`)
4. Add `<script src="shimport.js" data-notebook="@your-observable-username/your-notebook"></script>` to your HTML file
    - If you need cells which are not displayed to be loaded for their side-effects (as in the Breakout example), add the `data-load-all` attribute to the script tag
    - If you want to expose the window height as a builtin, add the `data-override-height` to the script tag. You can optionally also add the `override-height` class to the content element which you expect to be full height to make it take up the entire window before any content is rendered into it (you must include `style.css` in your HTML file for the latter to work)
6. Any cells with the class `loading` will be removed once all referenced cells have rendered at least once

## Examples
- [Animated Average Images](https://zzzev.github.io/observable-press/examples/aai/)
- [Breakout](https://zzzev.github.io/observable-press/examples/breakout/) (based on Jeremy Ashkenas' [example of notebook embedding](http://ashkenas.com/breakout/))
- [Tissot's Indicatrix](https://zzzev.github.io/observable-press/examples/tissots-indicatrix/) ([original notebook](https://observablehq.com/@fil/tissots-indicatrix) by [@fil](https://visionscarto.net/))

## Why Are There 3 JS Files?
- `shimport.js` is included in your HTML file, and checks if your browser supports dynamic imports, bringing in [shimport](https://github.com/Rich-Harris/shimport) if necessary.
- `bootstrap.js` pulls the notebook id (and optional settings) out of your HTML file, dynamically imports the notebook code from the Observable API, and calls `bootstrap` from...
- `observable-press.js` exports a `bootstrap` function that takes a notebook module from the Observable API and renders it into the page, including the loading logic, etc.

Yes, this could be improved (see TODOs). 

## observablehq.press
This library powers [observablehq.press](//observablehq.press), which is a simple service that takes a notebook and attempts to render a single cell as large as possible.

For example, check out [this Observable notebook](https://observablehq.com/@zzzev/slit-scan-effect) and its [presentation on observablehq.press](https://observablehq.press/@zzzev/slit-scan-effect).

You can try it by viewing a notebook on observablehq.com and changing the `.com` to `.press` -- if it doesn't work as you'd expect, please file an issue against this repository with a link to the notebook in question.

## Known Issues
If your notebook has special CORS access rules set up (e.g. [this one](https://observablehq.com/@tezzutezzu/world-history-timeline) that uses Google Sheets), it probably won't work if rehosted on a different domain.

## TODOs
- Create a bundled/minified version that combines `bootstrap.js`, `observable-press.js`, and inlines the Observable runtime so it's all contained in one download
- Nicer default loading indicator
- Better pending/error indication

### Project Goals
- Declarative
- No need to write code outside of notebook
- Good defaults, minimal config
- Hide Observable machinery, but cite source
- Add minimal additional weight
