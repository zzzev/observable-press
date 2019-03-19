import initialize from './initialize';

// This script pulls the options from the HTML document and invokes the bootstrap
// function from observable-press.js
const notebookAttribute = 'data-notebook';
const notebookId = document.querySelector(`[${notebookAttribute}]`)
    .getAttribute(notebookAttribute);

const loadAll = document.querySelector('[data-load-all]') !== null;

const overrideHeight = document.querySelector('[data-override-height]') !== null;

const apiUrl = `https://api.observablehq.com/${notebookId}.js`;

// Somewhat hacky workaround for dynamic imports.
//
// Since we only have one (the notebook), it's much simpler to do this than
// use something like shimport.
const scriptSrc = `
import notebook from '${apiUrl}';

observablePress.initialize(notebook, ${JSON.stringify({loadAll, overrideHeight})});
`;

const script = document.createElement('script');
script.innerHTML = scriptSrc;
script.setAttribute('type', 'module');
document.head.appendChild(script);

export {initialize};
