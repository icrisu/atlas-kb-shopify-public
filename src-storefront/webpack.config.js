
const path = require('path');
// update from 23.12.2018
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
	// entry: { main: './src/index.js' },
	entry: ['./src/index.js', './styles/index.scss'],
	optimization: {
		minimizer: [
		  new UglifyJsPlugin({
			cache: true,
			parallel: true,
			sourceMap: true // set to true if you want JS source maps
		  }),
		  new OptimizeCSSAssetsPlugin({})
		]
	},	
	output: {
		path: path.resolve(__dirname, 'dist/storefront'),
		filename: 'index.js'
	},
	target: 'node', // update from 23.12.2018
	externals: [nodeExternals()], // update from 23.12.2018
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.scss$/,
				use: [
				  // "style-loader",
				  MiniCssExtractPlugin.loader,
				  "css-loader",
				  "sass-loader"
				]
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "index.css"
		})		
	]
};
