import crypto from 'crypto'

const FRAME_CONTROL_FLAGS = {
	isFactoryNew: 1 << 0,
	isConnected: 1 << 1,
	isCentral: 1 << 2,
	isEncrypted: 1 << 3,
	hasMacAddress: 1 << 4,
	hasCapabilities: 1 << 5,
	hasEvent: 1 << 6,
	hasCustomData: 1 << 7,
	hasSubtitle: 1 << 8,
	hasBinding: 1 << 9
}

const CAPABILITY_FLAGS = {
	connectable: 1 << 0,
	central: 1 << 1,
	secure: 1 << 2,
	io: (1 << 3) | (1 << 4)
}

const EVENT_TYPES = {
	temperature: 4100,
	humidity: 4102,
	illuminance: 4103,
	moisture: 4104,
	fertility: 4105,
	battery: 4106,
	temperatureAndHumidity: 4109
}

const BASE_BYTE_LENGTH = 5

const bufferToString = payload => payload.toString('hex')

const parseFrameControl = payload => {
	const frameControl = payload.readUInt16LE(0)
	return Object.keys(FRAME_CONTROL_FLAGS).reduce((map, flag) => {
		map[flag] = (frameControl & FRAME_CONTROL_FLAGS[flag]) !== 0
		return map
	}, {})
}

const parseEventData = eventPayload => {

	const eventType = eventPayload.readUInt16LE(0)

	switch (eventType) {
		case EVENT_TYPES.temperature: {
			return {
				temperature: eventPayload.readInt16LE(3) / 10
			}
		}
		case EVENT_TYPES.humidity: {
			return {
				humidity: eventPayload.readUInt16LE(3) / 10
			}
		}
		case EVENT_TYPES.battery: {
			return {
				battery: eventPayload.readUInt8(3)
			}
		}
		case EVENT_TYPES.temperatureAndHumidity: {
			return {
				temperature: eventPayload.readInt16LE(3) / 10,
				humidity: eventPayload.readUInt16LE(5) / 10
			}
		}
		case EVENT_TYPES.illuminance: {
			return {
				illuminance: eventPayload.readUIntLE(3, 3)
			}
		}
		case EVENT_TYPES.fertility: {
			return {
				fertility: eventPayload.readInt16LE(3)
			}
		}
		case EVENT_TYPES.moisture: {
			return {
				moisture: eventPayload.readInt8(3)
			}
		}
		default: {
			throw new Error(
				`Unknown event type: ${eventType}. ${bufferToString(eventPayload)}`
			)
		}
	}
}

const getEventOffset = frameControl => {
	let offset = frameControl.hasMacAddress
		? 11
		: BASE_BYTE_LENGTH
	return frameControl.hasCapabilities
		? offset += 1
		: offset
}

const parseMacAddress = payload => {
	const macBuffer = payload.slice(
		BASE_BYTE_LENGTH,
		BASE_BYTE_LENGTH + 6
	)
	return Buffer.from(macBuffer)
		.reverse()
		.toString('hex')
}

const getCapabilityOffset = frameControl =>
	frameControl.hasMacAddress
		? 11
		: BASE_BYTE_LENGTH

const parseCapabilities = (payload, capabilityOffset) => {
	const capabilities = payload.readUInt8(capabilityOffset)
	return Object.keys(CAPABILITY_FLAGS).reduce((map, flag) => {
		map[flag] = (capabilities & CAPABILITY_FLAGS[flag]) !== 0
		return map
	}, {})
}

const decryptEventData = (payload, eventOffset, bindKey) => {
	const eventLength = payload.length - eventOffset

	if (eventLength < 3) { throw new Error('Event payload does not seem encrypted') } // TODO: see when if ever this happens

	const encryptedPayload = payload.slice(eventOffset, payload.length)

	const decipher = crypto.createDecipheriv(
		'aes-128-ccm',
		Buffer.from(bindKey, 'hex'), // key
		Buffer.concat([
			payload.slice(5, 11), // mac_reversed
			payload.slice(2, 4), // device_type
			payload.slice(4, 5), // frame_cnt
			encryptedPayload.slice(-7, -4) // ext_cnt
		]), // iv/nonce
		{ authTagLength: 4 }
	)

	const ciphertext = encryptedPayload.slice(0, -7)

	decipher.setAuthTag(encryptedPayload.slice(-4))
	decipher.setAAD(Buffer.from("11", "hex"), { plaintextLength: ciphertext.length })
	const decryptedEventPayload = decipher.update(ciphertext)
	decipher.final()

	return decryptedEventPayload
}

export const miBleParser = (
	payload,
	bindKey = null
) => {

	if (payload.length < BASE_BYTE_LENGTH) {
		throw new Error(
			`Service data length must be >= 5 bytes. ${bufferToString(payload)}`
		)
	}

	const frameControl = parseFrameControl(payload)

	if (frameControl.isEncrypted && !bindKey) {
		throw new Error('Payload is encrypted, but no decryption key was provided.')
	}

	return {
		version: payload.readUInt8(1) >> 4,
		productId: payload.readUInt16LE(2),
		frameCounter: payload.readUInt8(4),
		macAddress: frameControl.hasMacAddress
			? parseMacAddress(payload)
			: null,
		capabilities: frameControl.hasCapabilities
			? parseCapabilities(payload, getCapabilityOffset(frameControl))
			: null,
		event: frameControl.hasEvent
			? parseEventData(
				frameControl.isEncrypted
					? decryptEventData(payload, getEventOffset(frameControl), bindKey)
					: payload.slice(getEventOffset(frameControl))
			)
			: null
	}

}
