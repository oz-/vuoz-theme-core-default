// TODO: see https://tech.trivago.com/2015/12/17/export-multiple-javascript-module-formats/ for multiple configurations
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const RemovePlugin = require('remove-files-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')

const pkg = require('./package.json')
const LIBRARY_NAME = `${pkg.productName}`
const BUNDLE_NAME = `/${pkg.productName}.umd.min`

module.exports = {
  mode: "production",
  entry: {
    [BUNDLE_NAME]: [ path.resolve(__dirname, './src/index.ts') ],
    'css/theme': [ path.resolve(__dirname, './src/sass/theme.sass') ]
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    // filename: '[name].js',
    library: {
      name: LIBRARY_NAME,
      type: 'umd'
    },
    globalObject: 'this',
    clean: true
  },
  devtool: "source-map",
  resolve: {
    // Ajoute '.ts' et'.tsx' aux extensions traitées
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.tsx?$/,
        use: [/* 'ts-loader' */ 'babel-loader'],
        exclude: /node_modules/,

      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader"
          }
        ],
      },
      {
        test: /\.(eot|svg|ttf|otf|woff|woff2)(\??\#?v=[.0-9]+)?$/,
        use: 'file-loader?name=/fonts/[name].[ext]',
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    // Cleans the dist folder before compiling.
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.join(__dirname, 'dist/**/*')]
    }),
    // Extracts CSS
    new MiniCssExtractPlugin({
      filename: "[name].min.css",
      chunkFilename: "[id].css"
    }),
    // Copies source Sass files.
    new CopyPlugin({
      patterns: [
        { from: "./src/sass", to: "./sass" },
        { from: "./src/index.d.ts", to: "./types/index.d.ts" }
      ],
    }),
    // Removes files after compilation (ie. the .js file generated by MiniCssExtractPlugin)
    new RemovePlugin({
      // After compilation permanently remove empty JS files created from CSS entries.
      after: {
        test: [
          {
            folder: 'dist/css',
            method: (absoluteItemPath) => {
              return new RegExp(/\.*\.(js|map)$/, 'm').test(absoluteItemPath);
            },
          }
        ]
      }
    }),
    new ZipPlugin({
      path: './archive',
      filename: LIBRARY_NAME,
      pathPrefix: LIBRARY_NAME,
      include: [/\.(js|css|sass)$/],
      exclude: [ /\.map$/, /(theme)+(.js)$/i  ]
    })
  ],
  optimization: {
		removeEmptyChunks: true,
	},
}