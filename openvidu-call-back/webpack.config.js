const path = require('path');
const Dotenv = require('dotenv-webpack');


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
  optimization: {
    minimize: true,
  },
  plugins: [
    new Dotenv()
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