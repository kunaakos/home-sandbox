import noble from '@abandonware/noble'

import { miBleParser } from './mi-ble-parser'

const SERVICE_DATA_UUID = 'fe95'

const getMiServiceData = serviceData => 
	serviceData
		.find(serviceDatum => serviceDatum.uuid.toLowerCase() === SERVICE_DATA_UUID)

export const makeMiBleScanner = ({
	devices,
	options: {
		restartScanningIfStopped = true,
		restartDelay = 2500
	} = {},
	onSensorStateChange,
	logger = console
}) => {

	let isNobleScanning = false

	const start = () => {
		logger.info('Start scanning.')
		try {
			noble.startScanning([], true)
			isNobleScanning = true
		} catch (error) {
			isNobleScanning = false
			logger.error(error)
		}
	}

	const stop = () => {
		isNobleScanning = false
		noble.stopScanning()
	}

	const onStateChange = state => {
		if (state === 'poweredOn') {
			start()
		} else {
			logger.info(`Stop scanning. (${state})`)
			stop()
		}
	}

	const onWarning = message => { logger.info(message) }

	const onScanStart = () => { logger.debug('Started scanning.') }

	const onScanStop = () => {
		logger.info('Stopped scanning.')
		if (isNobleScanning && restartScanningIfStopped) {
			setTimeout(() => {
				logger.debug('Restarting scan.')
				start()
			}, restartDelay)
		}
	}

	const onDiscover = ({
		advertisement: {
			serviceData,
			localName
		} = {},
		address
	} = {}) => {

		const device = devices.find(device => device.address === address)
		if (!device) { return }

		// if (!serviceData) { return }
		// TODO: if a device is not in config, but has mi service data, add to list of discovered devices

		const miServiceData = getMiServiceData(serviceData)

		if (!miServiceData || !miServiceData.data) { return }

		try {
			const result = miBleParser(miServiceData.data, device && device.key)
			if (!result || !result.event) { return }
			onSensorStateChange({
				name: localName,
				address,
				values: result.event
			})
		} catch (error) {
			logger.warn(error)
		}

	}

	noble.on('discover', onDiscover)
	noble.on('scanStart', onScanStart)
	noble.on('scanStop', onScanStop)
	noble.on('warning', onWarning)
	noble.on('stateChange', onStateChange)

	return {
		start,
		stop
	}

}
