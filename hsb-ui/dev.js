const Bundler = require('parcel-bundler')
const Path = require('path')
const { fork } = require('child_process')

const { makeLogger } = require('hsb-service-utils/build/logger')

const logger = makeLogger({
	serviceName: 'build',
	serviceColor: 'gray',
	prettyPrint: process.env.HSB__PRETTY_PRINT_LOGS,
	logLevel: 'info'
})

const builErrorHandler = error => logger.error(error, 'error 💥')

const clientBundler = new Bundler(
	Path.join(__dirname, 'src/client/index.html'),
	{
		outDir: Path.join(__dirname, 'build/client'),
		outFile: 'index.html',
		publicUrl: './',
		watch: true,
		cache: true,
		cacheDir: Path.join(__dirname, '.parcel-cache/client'),
		contentHash: false,
		minify: false,
		scopeHoist: false,
		target: 'browser',
		bundleNodeModules: true,
		logLevel: 0,
		hmr: false,
		sourceMaps: true,
		detailedReport: false,
		autoInstall: false
	}
)

const serverBundler = new Bundler(
	Path.join(__dirname, 'src/server/main.js'),
	{
		outDir: Path.join(__dirname, 'build/server'),
		outFile: 'main.js',
		publicUrl: './',
		watch: true,
		cache: true,
		cacheDir: Path.join(__dirname, '.parcel-cache/server'),
		contentHash: false,
		minify: false,
		scopeHoist: false,
		target: 'node',
		bundleNodeModules: false,
		hmr: false,
		logLevel: 0,
		sourceMaps: true,
		detailedReport: false,
		autoInstall: false
	}
)

const go = async () => {

	const processes = {}

	const startProcess = path => {
		let process = fork(path)
		logger.info(`🥾  Starting node app 'ui', process id is #${process.pid}.`)
		processes[process.pid] = process
		process.once('close', (code, signal) => {
			delete processes[process.pid]
			if (code) {
				logger.error(`🤔  Node app #${process.pid} exited with exit code '${code}'.`)
			}
			if (signal) {
				logger.info(`💀  Node app #${process.pid} terminated by '${signal}'.`)
			}
		})
		return () => process.kill()
	}

	const killProcesses = () => {
		Object.values(processes).forEach(process => {
			logger.info(`🔪 Killing node app #${process.pid}.`)
			process.kill()
		})
	}

	serverBundler.on('buildStart', () => { logger.info(`🐌  Started building 'ui' server bundle.`) })
	clientBundler.on('buildStart', () => { logger.info(`🐌  Started building 'ui' client bundle.`) })
	clientBundler.on('bundled', () => { logger.info(`🎉  Finished building 'ui' client bundle.`) })
	serverBundler.on('bundled', async () => {
		logger.info(`🎉  Finished building 'ui' server bundle.`)
		killProcesses()
		try {
			startProcess(Path.join(__dirname, './build/server/main.js'))
		} catch (error) {
			logger.error(error, 'the \'ui\' server bundle won\'t run 🤷‍♂️')
		}
	});

	await clientBundler.bundle().catch(builErrorHandler)
	await serverBundler.bundle().catch(builErrorHandler)
}

go().catch(builErrorHandler)
