const Bundler = require('parcel-bundler')
const Path = require('path')
const { fork } = require('child_process')
const chalk = require('chalk')

const clientBundler = new Bundler(
	Path.join(__dirname, 'src/client/index.html'),
	{
		outDir: Path.join(__dirname, 'build/client'),
		outFile: 'index.html',
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
		console.log(chalk.green.bold(`🥾  Starting node app. ${chalk.gray(`(pid ${process.pid})`)}`))
		processes[process.pid] = process
		process.once('close', (code, signal) => {
			delete processes[process.pid]
			if (code) {
				console.log(chalk.red.bold(`🤔  Node app exited with exit code ${code}. ${chalk.gray(`(pid ${process.pid})`)}`))
			}
			if (signal) {
				console.log(chalk.gray.bold(`💀  Node app terminated by ${signal}. ${chalk.gray(`(pid ${process.pid})`)}`))
			}
		})
		return () => process.kill()
	}

	const killProcesses = () => {
		Object.values(processes).forEach(process => {
			console.log(chalk.yellow.bold(`🔪  Killing node app. ${chalk.gray(`(pid ${process.pid})`)}`))
			process.kill()
		})
	}

	serverBundler.on('buildStart', () => { console.log(chalk.yellow.bold(`🐌  Started building 'ui' server bundle.`)) })
	serverBundler.on('buildEnd', () => { console.log(chalk.green.bold(`🎉  Finished building 'ui' server bundle.`)) })
	clientBundler.on('buildStart', () => { console.log(chalk.yellow.bold(`🐌  Started building 'ui' client bundle.`)) })
	clientBundler.on('buildEnd', () => { console.log(chalk.green.bold(`🎉  Finished building 'ui' client bundle.`)) })

	serverBundler.on('bundled', async () => {
		killProcesses()
		startProcess(Path.join(__dirname, './build/server/main.js'))
	});

	await clientBundler.bundle()
	await serverBundler.bundle()
}

go()
