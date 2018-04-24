'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
	mode: 'production',
	cache: true,
	devtool: 'source-map',
	entry: {
		main : './src/main'
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		publicPath: 'dist/',
	},
	resolve: {
		modules: ['node_modules'],
		extensions: [".js", ".json", ".jsx", ".css"]
	},	
    plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
    ],
	module: {
		rules: [{
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		}, {
			test: /\.(jpe?g|png|gif|svg)$/i,
			use: 'file-loader'
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			use: [{
				loader:'babel-loader',
				options:{
					presets: ['env', 'react'],
					plugins: [
						'transform-es3-member-expression-literals',
						'transform-es3-property-literals',
						'transform-object-assign',
						'transform-object-rest-spread',
						'transform-decorators-legacy',
						['transform-es2015-classes', {loose: true}],
						'transform-proto-to-assign'
					]
				},
			}]
		}]
	}
}
