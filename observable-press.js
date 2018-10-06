import {Runtime} from 'https://unpkg.com/@observablehq/notebook-runtime?module';

/* Usage:
 * ```
 * import notebook from 'https://api.observablehq.com/@zzzev/my-notebook.js';
 * import bootstrap from 'observable-press';
 * bootstrap(notebook);
 * ```
 */
export default async function bootstrap(notebook) {
  const notebookId = notebook.id;

  let firstRenderPromises = [];

  Runtime.load(notebook, (cell) => {
    if (cell.name === 'title') {
      let promiseParts = getPromiseParts();
      firstRenderPromises.push(promiseParts.promise);
      return {
        fulfilled: (value) => {
          document.title = value instanceof HTMLElement ? value.innerText : value;
          promiseParts.resolve(value);
        },
        rejected: () => {
          promiseParts.reject();
        }
      }
    }
    const node = document.querySelector(`[data-cell="${cell.name}"]`);
    if (node) {
      let promiseParts = getPromiseParts();
      firstRenderPromises.push(promiseParts.promise);
      return {
        pending: () => {
          node.classList.add('pending');
        },
        fulfilled: (value) => {
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
      };
    }
  });
  
  try {
    console.log(`awaiting ${firstRenderPromises.length} cells`);
    await Promise.all(firstRenderPromises);
    // remove first load indicators once all watched nodes have rendered first time
    document.querySelectorAll('.loading').forEach(node => node.remove());
  } catch (e) {
    console.error(e);
    showError(`An error occured while loading this notebook. Visit the
      <a href="${getNotebookUrl(notebookId)}">original notebook</a>
      for more information.`);
  }
}


// Helper functions:
const getNotebookUrl = (id) => {
  return `https://beta.observablehq.com/${id[0] === '@' ? id : 'd/' + id.replace(/'@.*'/, '')}`
};

// A convenience function that returns a promise and its
// resolve and reject callbacks.
function getPromiseParts() {
  let parts = {};
  parts.promise = new Promise((resolve, reject) => {
    parts.resolve = resolve;
    parts.reject = reject;
  });
  return parts;
}

function showError(errorHtml) {
  document.querySelector('.loading').innerHTML = `<span>${errorHtml}</span>`;
}