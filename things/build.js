const Bundler = require('parcel-bundler')
const Path = require('path')

const bundler = new Bundler(
	Path.join(__dirname, './src/main.js'),
	{
		outDir: Path.join(__dirname, 'build'),
		outFile: 'main.js',
		watch: false,
		cache: false,
		contentHash: false,
		minify: false,
		scopeHoist: false,
		target: 'node',
		bundleNodeModules: false,
		hmr: false,
		sourceMaps: true,
		detailedReport: false,
		autoInstall: false
	}
)

bundler.bundle()
