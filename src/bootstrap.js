import bootstrap from './observable-press.js';

const notebookAttribute = 'data-notebook';
const notebookId = document.querySelector(`[${notebookAttribute}]`).getAttribute(notebookAttribute);

const loadAll = document.querySelector('[data-load-all]') !== null;

const overrideHeight = document.querySelector('[data-override-height]') !== null;

import(`https://api.observablehq.com/${notebookId}.js`)
  .then(notebook => bootstrap(notebook.default, {loadAll, overrideHeight}));
