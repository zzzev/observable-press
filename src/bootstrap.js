import bootstrap from 'https://cdn.jsdelivr.net/gh/zzzev/observable-press/src/observable-press.js';

const notebookAttribute = 'data-notebook';

const notebookId = document.querySelector(`[${notebookAttribute}]`).getAttribute(notebookAttribute);

const loadAll = document.querySelector(`[data-load-all]`) !== null;

import(`https://api.observablehq.com/${notebookId}.js`)
  .then(notebook => bootstrap(notebook.default, loadAll));
