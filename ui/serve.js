import Bundler from 'parcel-bundler'
import Path from 'path'

const entryFile = Path.join(__dirname, './src/index.html');

const devOptions = {
  outDir: Path.join(__dirname, './.parcel-build'),
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
};

(async function() {
  const bundler = new Bundler(entryFile, devOptions)
  await bundler.serve(process.env.WEB_UI_PORT)
})()