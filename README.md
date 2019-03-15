# observable-press
An opinionated way to publish [Observable notebooks](//observablehq.com).

The core idea is to do all your coding in your notebook, write an HTML skeleton for its presentation, and let `observable-press` glue it all together.

The [Observable Runtime](https://github.com/observablehq/runtime) makes this pretty easy to do with no library, but `observable-press` adds a consistent pattern that allows you to write zero code outside your notebook, and also adds some small conveniences (initial loading indicator, new `height` builtin).

### Simplest Example

[code](examples/simple/index.html) // [demo](https://zzzev.github.io/observable-press/examples/simple)

A very simple example looks like this:
```
<!DOCTYPE html>
<html>
  <link rel="stylesheet" href="../../src/style.css">
  <script src="bootstrap.js" data-notebook="@zzzev/slit-scan-effect" data-override-height></script>
</html>
```

First, we include some simple default styles. These are optional, though you will need some similar styles if you want to have full-window rendering with no margins.

Then, we include the `observable-press` library in a script tag. The `data-notebook` attribute on this tag is used to specify the notebook that should be loaded. 

`data-override-height` is an optional attribute, if present it will delete the named variable `height` from the notebook (which causes it to instead use the builtin provided by `observable-press` which matches window height).

Because there are no HTML nodes in the document with `data-cell` set, the library picks the first "content-like" variable in the notebook and renders it into the body.

### Using `data-cell`s and `.loading`

[code](examples/simple-ui/index.html) // [demo](https://zzzev.github.io/observable-press/examples/simple-ui)

A slightly more complex example has an HTML body like this:
```
<div class="ui" data-cell="viewof reverse"></div>
<div class="override-height" data-cell="canvas"></div>
<div class="loading">loading...</div>
```

This includes two tags with `data-cell` attributes, which will be populated by the matching named variables from the notebook. Since there's at least one explicitly specified `data-cell`, it won't pick one automatically. Note that `viewof` must be included in the cell name if you want to render the view of a variable.

This also includes a tag with the class `loading`, which will be automatically removed once the specified `data-cell`s have all rendered at least once. This makes it easy to include a simple loading indicator.

## Why Are There 2 JS Files?
- `bootstrap.js` pulls the notebook id (and optional settings) out of your HTML file, dynamically imports the notebook code from the Observable API via a semi-hacky workaround for dynamic `import()`, and calls `bootstrap` from...
- `observable-press.js` exports a `bootstrap` function that takes a notebook module from the Observable API and renders it into the page, including the loading logic, etc.

This could probably be improved.

## Troubleshooting
If your notebook has special CORS access rules set up, it probably won't work if rehosted on a different domain.

## TODOs
- Create a bundled/minified version that minifies `observable-press.js` and its dependencies
- Nicer default loading indicator
- Better pending/error indication

## Licensing
`observable-press` is MIT licensed

Notebooks published on Observable without an explicit license are licensed under [the terms described here](https://observablehq.com/terms-of-service), and cannot be freely re-used on a different site unless you are the original author or have permission.

This project is not affiliated or endorsed by Observable, Inc.