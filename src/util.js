// A convenience function that returns a promise and its resolve and reject callbacks.
const getPromiseParts = () => {
  let parts = {};
  parts.promise = new Promise((resolve, reject) => {
    parts.resolve = resolve;
    parts.reject = reject;
  });
  return parts;
}

// Common code that returns an observer which will populate the given [node] when
// fulfilled and also update the passed in [promiseParts]
const createNodeObserver = (node, promiseParts) => ({
  pending: () => {
    node.classList.add('pending');
  },
  fulfilled: (value) => {
    // resolve promise -- note this only has an effect the first time this is called
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
});

export { getPromiseParts, createNodeObserver };