'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = {
	cache: true,
    entry: {
		main : './_es6'
	},
	output: {
		filename: 'test_es6.js',
		path: __dirname,
	},
	resolve: {
		modules: [path.resolve(__dirname, 'src'), 'node_modules'],
		unsafeCache: true,
	},
	resolveLoader: {
		modules: ['node_modules']
	},
	module: {
		rules: [{
			test: /\.js$/,
			include: path.resolve(__dirname, '.'),
			exclude: /node_modules/,
			use : [{
                loader: 'babel-loader',
			    options: {
				    cacheDirectory: true,
				    presets: [['es2015',{"modules":false}]],
				    plugins: [
    					'transform-decorators-legacy',
	    			]
                },
            }]
		}]
	}
}