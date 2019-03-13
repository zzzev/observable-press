import {Runtime} from 'https://unpkg.com/@observablehq/runtime?module';

export default async function bootstrap(notebook, loadAll = false) {
  if (!document.querySelector('title')) {
    document.title = 'Loading notebook...';
  }

  const notebookId = notebook.id;

  let firstRenderPromises = [];

  const dataCells = document.querySelectorAll('[data-cell]');
  // If there are HTML nodes with data-cell attributes, we load cells with the given names
  // into them.
  // If there are no such nodes, we load the first cell we find with a content-like name.
  const hasDefinedCells = dataCells.length !== 0;

  // Find first content-like name
  const allCellNames = notebook.modules
      .map(m => m.variables.map(v => v.name))
      .reduce((a, b) => a.concat(b), []);
  let contentCellName = allCellNames.find(isRenderableName);

  if (!contentCellName) {
    // If no content-like name was found, observe all nodes and show the first
    // one that comes back as a canvas or svg element
    const firstContentPromiseParts = getPromiseParts();
    firstRenderPromises.push(firstContentPromiseParts.promise);
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('content')
    document.body.appendChild(contentWrapper);

    Runtime.load(notebook, cell => {
      const promiseParts = getPromiseParts();
      const node = document.createElement('div');
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
    // There's a known, content-like name, so only observe that cell
    Runtime.load(notebook, cell => {
      let node;
      if (hasDefinedCells) {
        node = document.querySelector(`[data-cell="${cell.name}"]`);
      } else if (cell.name === contentCellName) {
        node = document.createElement('div');
        node.classList.add('content');
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
  
  try {
    await Promise.all(firstRenderPromises);
    document.querySelectorAll('.loading').forEach(node => node.remove());
    if (!document.querySelector('title')) {
      document.title = `Observable Press Notebook: ${notebookId}`;
    }
  } catch (e) {
    console.error(e);
    showError(`An error occured while loading this notebook. Visit the
      <a href="${getNotebookUrl(notebookId)}">original notebook</a>
      for more information.`);
  }
}

const createNodeObserver = (node, promiseParts) => ({
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
})

const renderableNames = new Set(['canvas', 'svg', 'content', 'chart', 'map']);
const isRenderableName = name => renderableNames.has(name);

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
