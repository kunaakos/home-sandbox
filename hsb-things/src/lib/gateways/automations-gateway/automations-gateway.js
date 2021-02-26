import { AUTOMATIONS_GATEWAY_ID } from '../../../config'

import { 
	readGatewayConfig,
	readVirtualThingConfigs
} from '../../../db-queries'
import { makeThermostat } from '../../things/thermostat'

/**
 * Side effect-ey function that checks if creating the automations gateway is needed.
 * 
 * The automations gateway needs to behave like all other gateways, and its config/id
 * written to the database due to foreign key constraints on the thing_id table.
 * But it has a hardcoded easily recognizable id (so it's possible to keep its config
 * from showing up in the UI and for fun) - hence the special treatment.
 */ 
export const checkForAutomationsGatewayConfig = async () => {
	if (!(await readGatewayConfig(AUTOMATIONS_GATEWAY_ID))) {
		logger.info('adding automations gateway config to database')
		return await addGatewayConfig({
			id: AUTOMATIONS_GATEWAY_ID,
			type: 'automations-gateway',
			label: 'Automations',
			isActive: true,
			config: {}
		})
	}
}

const initializeVirtualThing = ({
	virtualThingConfig: {
		id,
		type,
		label,
		config
	},
	publishChange
}) => {

	const args = {
		type,
		label,
		isHidden: false, // NOTE: can be overridden in config
		...config,
		publishChange: publishChange(id),
		fingerprint: `AUTOMATIONS__${id}`,
		gatewayId: AUTOMATIONS_GATEWAY_ID,
		initialState: {}
	}

	switch (type) {

		case 'thermostat':
			return makeThermostat(args)

		default:
			throw new Error(`Unsupported thing config type '${type}'.`)

	}
}

export const makeAutomationsGateway  = async ({
	things,
	publishChange
}) => {

	checkForAutomationsGatewayConfig()

	const virtualThingConfigs = await readVirtualThingConfigs()
	for (const virtualThingConfig of virtualThingConfigs) {
		await things.add(initializeVirtualThing({ virtualThingConfig, publishChange }))
	}

}
