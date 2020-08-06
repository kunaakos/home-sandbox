const Bundler = require('parcel-bundler')
const Path = require('path')

const bundler = new Bundler(
	Path.join(__dirname, './src/main.js'),
	{
		outDir: Path.join(__dirname, './build/'),
		outFile: 'main.js',
		publicUrl: './',
		watch: false,
		cache: false,
		contentHash: false,
		minify: false,
		scopeHoist: false,
		target: 'node',
		bundleNodeModules: false,
		logLevel: 1,
		hmr: false,
		sourceMaps: true,
		detailedReport: false,
		autoInstall: false
	}
)

const go = async () => {
	await bundler.bundle()
}

go()
