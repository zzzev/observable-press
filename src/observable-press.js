import {Runtime, Library} from 'https://unpkg.com/@observablehq/runtime?module';

// Given an Observable notebook module [notebook], run it, placing
// all named cells into the HTML tag with the matching data-cell
// attribute.
//
// If no data-cell attributes are set, attempts to find the first named
// cell with a "content-looking" name. If none is found, it chooses the
// first cell which returns an SVG or canvas element. This cell is then
// rendered into the body of the document.
//
// [loadAll] will cause all cells to be observed, even if not rendered.
// [overrideHeight] will redefine the height variable to be equal to the
// window height, similar to the way width works in normal notebooks.
export default async function bootstrap(notebook, {loadAll, overrideHeight}) {
  if (!document.querySelector('title')) {
    document.title = 'Loading notebook...';
  }

  const notebookId = notebook.id;

  let firstRenderPromises = [];

  // If there are HTML nodes with data-cell attributes, we load cells with the given names
  // into them.
  // If there are no such nodes, we load the first cell we find with a content-like name.
  const dataCells = document.querySelectorAll('[data-cell]');
  const hasDefinedCells = dataCells.length !== 0;

  // Find first content-like name
  const allCellNames = notebook.modules
      .map(m => m.variables.map(v => v.name))
      .reduce((a, b) => a.concat(b), []);
  let contentCellName = allCellNames.find(isRenderableName);

  // Use a normal Observable stdlib, but add a new builtin height = window.clientHeight
  let stdlib = new Library();
  Object.defineProperty(stdlib, 'height', {
    value: getHeightBuiltin(stdlib.Generators.observe),
    writable: true,
    enumerable: true
  });

  if (overrideHeight && allCellNames.indexOf('height') !== -1) {
    // "undefine" height variable if set, to allow custom builtin to override it
    notebook.modules.forEach((m, i) => {
      m.variables = m.variables.filter(v => v.name !== 'height');
    });
  }

  if (!hasDefinedCells && !contentCellName) {
    // If no content-like name was found, observe all nodes and show the first
    // one that comes back as a canvas or svg element
    const firstContentPromiseParts = getPromiseParts();
    firstRenderPromises.push(firstContentPromiseParts.promise);
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content')
    document.body.appendChild(contentWrapper);

    Runtime.load(notebook, stdlib, () => {
      const promiseParts = getPromiseParts();
      const node = document.createElement('div');
      if (overrideHeight) {
        node.classList.add('override-height');
      }
      const observer = createNodeObserver(node, promiseParts);
      return {
        pending: () => {
          observer.pending();
        },
        fulfilled: (value) => {
          if (value instanceof HTMLCanvasElement || value instanceof SVGElement) {
            firstContentPromiseParts.resolve();
            observer.fulfilled(value);
            contentWrapper.innerHTML = '';
            contentWrapper.appendChild(node);
          } else {
            observer.fulfilled(value);
          }
        },
        rejected: (error) => {
          observer.rejected(error);
        }
      };
    })
  } else {
    // We want specific cells (either named in data-cell attr. or
    // a single content cell), so only observe those.
    Runtime.load(notebook, stdlib, cell => {
      let node;
      if (hasDefinedCells && cell.name) {
        node = document.querySelector(`[data-cell="${cell.name}"]`);
      } else if (contentCellName && cell.name === contentCellName) {
        node = document.createElement('div');
        node.classList.add('content');
        if (overrideHeight) {
          node.classList.add('override-height');
        }
        document.body.appendChild(node);
      }
      if (node) {
        let promiseParts = getPromiseParts();
        firstRenderPromises.push(promiseParts.promise);
        return createNodeObserver(node, promiseParts);
      }
      return loadAll;
    });
  }
  
  // Await initial fulfillment of all observed cells
  try {
    await Promise.all(firstRenderPromises);
    document.querySelectorAll('.loading').forEach(node => node.remove());
    if (!document.querySelector('title')) {
      document.title = `Observable Press Notebook: ${notebookId}`;
    }
  } catch (e) {
    console.error(e);
    // TODO: better error handling of initial load
  }
}

// Common code that returns an observer which will populate the given [node] when
// fulfilled and also update the passed in [promiseParts]
const createNodeObserver = (node, promiseParts) => ({
  pending: () => {
    node.classList.add('pending');
  },
  fulfilled: (value) => {
    // resolve promise -- note this only has an effect the first time this is called
    promiseParts.resolve(value);
    node.classList.remove('pending');
    node.innerHTML = '';
    if (value instanceof Node) {
      node.appendChild(value);
    } else {
      node.innerText = JSON.stringify(value);
    }
  },
  rejected: (error) => {
    promiseParts.reject(error);
    node.classList.remove('pending');
    node.classList.add('error');
    node.innerText = error.message;
  }
})

// Names which are considered "content-like" and will be rendered if no
// data-cell is specified.
const renderableNames = new Set(['canvas', 'svg', 'content', 'chart', 'map']);
const isRenderableName = name => renderableNames.has(name);

const getNotebookUrl = id => {
  const suffix = id[0] === '@' ? id : 'd/' + id.replace(/'@.*'/, '');
  return `https://beta.observablehq.com/${suffix}`;
};

// Slightly altered version of observablehq/stdlib/src/width.js
const getHeightBuiltin = observe => {
  return function() {
    return observe(function(change) {
      var height = change(document.body.clientHeight);
      function resized() {
        var h = document.body.clientHeight;
        console.log(h);
        if (h !== height) change(height = h);
      }
      window.addEventListener("resize", resized);
      return function() {
        window.removeEventListener("resize", resized);
      };
    });
  }
}

// A convenience function that returns a promise and its resolve and reject callbacks.
const getPromiseParts = () => {
  let parts = {};
  parts.promise = new Promise((resolve, reject) => {
    parts.resolve = resolve;
    parts.reject = reject;
  });
  return parts;
}
