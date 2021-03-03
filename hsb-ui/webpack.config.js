const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = (env, argv) => {

	const isProd = argv.mode === 'production'

	return {
		entry: './src/main.js',
		output: {
			filename: '[name].[contenthash].js',
			path: path.resolve(__dirname, 'build'),
			clean: true,
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
		optimization: {
			splitChunks: {
			  	chunks: 'all',
			},
		},
		devServer: {
			contentBase: './static',
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
			...(
				isProd
					? [new CopyPlugin({
						patterns: [
						  	{ from: 'static', to: '.' },
						],
					})]
					: []
			)
		],
	}

}
