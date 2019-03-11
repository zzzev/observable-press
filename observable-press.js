import {Runtime} from 'https://unpkg.com/@observablehq/runtime?module';

export default async function bootstrap(notebook) {
  const notebookId = notebook.id;

  let firstRenderPromises = [];

  const dataCells = document.querySelectorAll('[data-cell]');
  // If there are HTML nodes with data-cell attributes, we load cells with the given names
  // into them.
  // If there are no such nodes, we load the first cell we find with a content-like name.
  const hasDefinedCells = dataCells.length !== 0;

  Runtime.load(notebook, (cell) => {
    let node;
    if (hasDefinedCells) {
      node = document.querySelector(`[data-cell="${cell.name}"]`);
    } else if (firstRenderPromises.length === 0 && renderableNames.has(cell.name)) {
      node = document.createElement('div');
      node.classList.add('content');
      document.body.appendChild(node);
    }
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

const renderableNames = new Set(['canvas', 'svg', 'content']);

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