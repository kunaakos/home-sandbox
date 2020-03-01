const Bundler = require('parcel-bundler')
const Path = require('path')
const { fork } = require('child_process')

const { makeLogger } = require('hsb-service-utils/build/logger')

const logger = makeLogger({
	serviceName: 'build',
	serviceColor: 'gray',
	environment: process.env.NODE_ENV,
	forceLogLevel: 'info',
})

const builErrorHandler = error => logger.error(error, 'error 💥')

const bundler = new Bundler(
	Path.join(__dirname, './src/main.js'),
	{
		outDir: Path.join(__dirname, 'build'),
		outFile: 'main.js',
		publicUrl: './',
		watch: true,
		cache: true,
		cacheDir: Path.join(__dirname, '.parcel-cache'),
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
		logger.info(`🥾  Starting node app #${process.pid}.`)
		processes[process.pid] = process
		process.once('close', (code, signal) => {
			delete processes[process.pid]
			if (code) {
				logger.error(`🤔  Node app #${process.pid} exited with exit code '${code}'.`)
			}
			if (signal) {
				logger.info(`💀   Node app #${process.pid} terminated by '${signal}'.`)
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

	bundler.on('buildStart', () => { logger.info(`🐌  Started building 'things' bundle.`) })
	bundler.on('buildEnd', () => { logger.info(`🎉  Finished building 'things' bundle.`) })

	bundler.on('bundled', async () => {
		killProcesses()
		startProcess(Path.join(__dirname, './build/main.js'))
	});

	await bundler.bundle().catch(builErrorHandler)
}

go().catch(builErrorHandler)
