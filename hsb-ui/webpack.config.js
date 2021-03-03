const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, argv) => {

	const isProd = argv.mode === 'production'

	return {
		entry: './src/main.js',
		output: {
			filename: 'bundle.js',
			path: path.resolve(__dirname, 'build'),
		},
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							plugins: [
								'@emotion',
								'@babel/plugin-transform-runtime'
							],
							presets: [
								'@babel/preset-react',
								'@babel/preset-env'
							]
						},
					},
				},
			],
		},
		devServer: {
			contentBase: './public',
			port: 8001,
			hot: true,
			historyApiFallback: true
		},
		devtool: 
			isProd
				? 'hidden-source-map'
				: 'eval-source-map',
		plugins: [
			new HtmlWebpackPlugin({
			  template: './src/index.html',
			}),
		],
	}

}
