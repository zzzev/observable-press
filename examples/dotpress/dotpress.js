let notebookPath = location.hash.length > 1
                        ? location.hash.slice(1)
                        : location.pathname.slice(1);
if (notebookPath[notebookPath.length - 1] === '/') {
  notebookPath = notebookPath.slice(0, -1);
}

const meta = document.createElement('meta');
meta.setAttribute('data-notebook', notebookPath);
document.head.appendChild(meta);

const cite = document.createElement('a');
cite.classList.add('cite');
cite.innerHTML = 'View source notebook';
cite.setAttribute('href', `https://observablehq.com/${notebookPath}`);
document.body.appendChild(cite);

function shimport(src) {
  try {
    new Function('import("' + src + '")')();
  } catch (e) {
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/shimport';
    s.dataset.main = src;
    document.head.appendChild(s);
  }
}

const results = shimport('https://cdn.jsdelivr.net/gh/zzzev/observable-press/src/bootstrap.js');
