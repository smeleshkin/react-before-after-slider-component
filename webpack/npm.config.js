const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const npmConfig = () => ({
  entry: './src/index.tsx',
  ...(process.env.production || !process.env.development
    ? {}
    : { devtool: 'eval-source-map' }),

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'build.js',
    library: ['ReactBeforeAfterSliderComponent'],  // Configuring the library namespace
    libraryTarget: 'umd',          // Configuring the library target
    libraryExport: 'default',     // Configuring the default export of the entry point to the namespace
    globalObject: 'this',
  },
  externals: {
    react: 'react',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
              loader: 'css-loader',
          },
          {
              loader: 'sass-loader',
          }
        ]
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'build.css',
    })
  ],
});

module.exports = npmConfig;
