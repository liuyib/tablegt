/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV || 'development',
  entry: {
    tbuilder: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    library: 'TBuilder',
    libraryTarget: 'commonjs2',
  },
  devtool: isDev ? '' : 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
