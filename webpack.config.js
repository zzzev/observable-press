const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'observable-press.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'observablePress',
    libraryTarget: 'umd'
  }
};
