import {Runtime} from '@observablehq/runtime';
import {getLibrary} from './library'
import {getPromiseParts, createNodeObserver} from './util';

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
const initialize = async function initialize(notebook, {loadAll, overrideHeight}) {
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

  const library = getLibrary();

  const runtime = new Runtime(getLibrary());

  let notebookModule;

  if (!hasDefinedCells) {
    // If no cell names are specified, observe all nodes and show the first
    // one that comes back as a canvas or svg element
    const firstContentPromiseParts = getPromiseParts();
    firstRenderPromises.push(firstContentPromiseParts.promise);
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content')
    document.body.appendChild(contentWrapper);

    notebookModule = runtime.module(notebook, () => {
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
    // We want specific cells (named in data-cell attr), so only observe those.
    notebookModule = runtime.module(notebook, cellName => {
      let node;
      if (cellName) {
        node = document.querySelector(`[data-cell="${cellName}"]`);
        if (node) {
          let promiseParts = getPromiseParts();
          firstRenderPromises.push(promiseParts.promise);
          return createNodeObserver(node, promiseParts);
        }
      }
      return loadAll;
    });
  }

  if (overrideHeight) {
    notebookModule.redefine('height', () => null).delete();
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

// Names which are considered "content-like" and will be rendered if no
// data-cell is specified.
const renderableNames = new Set(['canvas', 'svg', 'content', 'chart', 'map']);
const isRenderableName = name => renderableNames.has(name);

export default initialize;
