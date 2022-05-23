const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
  entry: './src/app.ts',
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'openvidu-call-server.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        {
          from: __dirname + "/src/certs",
          to: __dirname + "/dist/certs"
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader',
        ]
      }
    ]
  }
}