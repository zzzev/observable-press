const notebookPath = location.hash.length > 1
                        ? location.hash.slice(1)
                        : location.pathname.slice(1);
const notebookUrl = `https://api.observablehq.com/${notebookPath}.js`;

const source = `
import bootstrap from './observable-press.js';
import notebook from '${notebookUrl}';
bootstrap(notebook);`;

const script = document.createElement('script');
script.setAttribute('type', 'module');
script.innerHTML = source;
document.body.appendChild(script);

const cite = document.createElement('a');
cite.classList.add('cite');
cite.innerHTML = 'View source notebook';
cite.setAttribute('href', `https://observablehq.com/${notebookPath}`);
document.body.appendChild(cite);