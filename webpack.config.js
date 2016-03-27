module.exports = {
	entry: "./script.js",   			
	output: {
		path: './',
		filename: "bundle.js"	             // Where to put transpiled components (aka index.js)
	},
	devtool: 'source-map',
	devServer: {
		inline: true,                                     // Reload on the fly
		port: 3333                                       // any
	},
	resolve: {
	// Add resolvable extensions to avoid typing extensions in imports.
	extensions: ['', '.webpack.js', '.web.js', '.js', '.css', '.html']
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			}
		]
	}
}