const Bundler = require('parcel-bundler')
const Path = require('path')

const clientBundler = new Bundler(
	Path.join(__dirname, './src/client/index.html'),
	{
		outDir: Path.join(__dirname, './build/client'),
		outFile: 'index.html',
		watch: false,
		cache: false,
		contentHash: true,
		minify: true,
		scopeHoist: false,
		target: 'browser',
		bundleNodeModules: true,
		logLevel: 1,
		hmr: false,
		sourceMaps: true,
		detailedReport: false,
		autoInstall: false
	}
)

const serverBundler = new Bundler(
	Path.join(__dirname, './src/server/main.js'),
	{
		outDir: Path.join(__dirname, './build/server'),
		outFile: 'main.js',
		watch: false,
		cache: false,
		contentHash: false,
		minify: false,
		scopeHoist: false,
		target: 'node',
		bundleNodeModules: true,
		logLevel: 1,
		hmr: false,
		sourceMaps: true,
		detailedReport: false,
		autoInstall: false
	}
)

const build = async () => {
	await clientBundler.bundle()
	await serverBundler.bundle()
}

build()
