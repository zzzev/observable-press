import {Library, Runtime} from 'https://unpkg.com/@observablehq/notebook-runtime?module';

// If you cannot use dynamic imports, use a static import like this:
// import notebook from 'https://api.observablehq.com/d/895ffec7eb2c9e1b.js'

const getNotebookJsUrl = (id) => `https://api.observablehq.com/${id}.js`;
const getNotebookUrl = (id) => `https://beta.observablehq.com/${id}`;

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

async function bootstrap() {
  const notebookId = document.querySelector('meta[name="notebook"]').content;

  let notebook;
  try {
    notebook = (await import(getNotebookJsUrl(notebookId))).default;
  } catch (e) {
    showError(`Could not import notebook with id ${notebookId}.
    Are you sure it exists and is available?`);
  }

  let firstRenderPromises = [];

  Runtime.load(notebook, (cell) => {
    if (!cell.name) {
      // Ignore un-named cells
      return;
    }
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
    await Promise.all(firstRenderPromises);
    // remove first load indicators once all watched nodes have rendered first time
    document.querySelectorAll('.loading').forEach(node => node.remove());
  } catch (e) {
    showError(`An error occured while loading this notebook. Visit the
      <a href="${getNotebookUrl(notebookId)}">original notebook</a>
      for more information.`);
  }
}

bootstrap();
