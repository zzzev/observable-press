const notebookPath = location.hash.slice(1);
const notebookUrl = `https://api.observablehq.com/${notebookPath}.js`;

const source = `
import bootstrap from './../../observable-press.js';
import notebook from '${notebookUrl}';
bootstrap(notebook);`;

const script = document.createElement('script');
script.setAttribute('type', 'module');
script.innerHTML = source;
document.body.appendChild(script);
