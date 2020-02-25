const Bundler = require('parcel-bundler')
const Path = require('path')

const bundler = new Bundler(
	Path.join(__dirname, './src/client/index.html'),
	{
		outDir: Path.join(__dirname, './build/client'),
		outFile: 'index.html', 
		// publicUrl: './', // see: https://github.com/parcel-bundler/parcel/issues/2855
		watch: true,
		cache: true,
		cacheDir: Path.join(__dirname, './.parcel-cache'),
		contentHash: false,
		minify: false,
		scopeHoist: false,
		target: 'browser',
		bundleNodeModules: true,
		logLevel: 3,
		hmr: true,
		hmrPort: 0, // resolves to a random free port
		hmrHostname: '',
		sourceMaps: true,
		detailedReport: false,
		autoInstall: false
	}
)

bundler.bundle()
