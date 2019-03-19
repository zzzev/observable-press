import {Library} from '@observablehq/runtime';

// A normal Observable Library, but with additional `height` builtin.
const getLibrary = () => {
  const lib = new Library();
  Object.defineProperty(lib, 'height', {
    value: getHeightBuiltin(lib.Generators.observe),
    writable: true,
    enumerable: true
  });
  return lib;
}

// Slightly altered version of observablehq/stdlib/src/width.js
const getHeightBuiltin = observe => {
  return function() {
    return observe(function(change) {
      var height = change(window.innerHeight);
      function resized() {
        var h = window.innerHeight;
        if (h !== height) change(height = h);
      }
      window.addEventListener("resize", resized);
      return function() {
        window.removeEventListener("resize", resized);
      };
    });
  }
}

export {getLibrary};