'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = {
	mode:"development",
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
	externals : function(context, request, callback) {
		if (['../index'].indexOf(request)!=-1){ // Do not inline this file (to count _es6.js tests at coverage)
			callback(null, "commonjs " + request);
		} else {
			callback(); //inline all service files (used for ES6 transpillation)
		}
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