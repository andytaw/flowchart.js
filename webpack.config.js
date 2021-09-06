var path = require('path');
var webpack = require('webpack');
var moment = require('moment');

var component = require('./package.json');
var banner =
	'// ' + component.name + ', v' + component.version + '\n' +
	'// Copyright (c)' + moment().format('YYYY') + ' Adriano Raiano (adrai).\n' +
	'// Distributed under MIT license\n' +
	'// http://adrai.github.io/flowchart.js\n';

var NODE_ENV = (process.env.NODE_ENV || 'development').trim();
var defines = new webpack.DefinePlugin({
	'process.env': {
		'NODE_ENV': JSON.stringify(NODE_ENV)
	}
});

var config = {
	devtool: 'source-map', // always build source map
	entry: [
		'webpack-hot-middleware/client',
		'./index'
	],
	output: {
		path: path.join(__dirname, 'release'),
		filename: component.name + '.js',
		publicPath: '/release/'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		defines
	],
	resolve: {
		extensions: ['', '.js'],
		modulesDirectories: ['src', 'node_modules'],
		alias: {
			'dev/raphael.core.js': './dev/raphael.core.js',
			'raphael.core': './raphael.core.js',
			'raphael.svg': './dev/raphael.svg.js',
			'raphael.vml': './dev/raphael.vml.js'
		}
	}
};

console.log('********* NODE_ENV: <' + NODE_ENV + '>');
console.log('********* MINIFIED: ' + process.env.MINIFIED);

if (NODE_ENV === 'production') {
	console.log('********* production build *********');
	var minified = (process.env.MINIFIED || '').trim() == '1';
	var withoutJs = component.name;
	withoutJs = withoutJs.replace('.js', '');
	var filename = minified ? withoutJs + '.min.js' : withoutJs + '.js';
	console.log('********* filename: ' + filename);
	var uglifyOptions = {
		sourceMap: true,
		compressor: {
			warnings: false,
			dead_code: true
		},
		output: {
			preamble: banner,
			comments: false
		}
	};
	if (!minified) {
		uglifyOptions.beautify = true;
		uglifyOptions.mangle = false;
		uglifyOptions.output.comments = 'all';
	}
	config.entry = './index';
	config.externals = {
		raphael: 'Raphael'
	};
	config.output = {
		devtoolLineToLine: true,
		sourceMapFilename: filename + '.map',
		path: path.join(__dirname, 'release'),
		filename: filename,
		libraryTarget: 'umd'
	};
	config.plugins = [
		new webpack.optimize.OccurenceOrderPlugin(),
		defines,
		new webpack.optimize.UglifyJsPlugin(uglifyOptions)
	];
}
else{
	console.log('********* non-production build *********');
}

module.exports = config;
