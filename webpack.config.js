const path = require('path');

module.exports = {
  entry: './src/index.js', // Adjust this entry point according to your project setup
  output: {
    path: path.resolve(__dirname, 'dist'), // Adjust the output directory if needed
    filename: 'bundle.js', // Adjust the output filename if needed
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
};