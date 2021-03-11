import React from 'react'

import { LightVerse } from './light-verse'
import { SwitchVerse } from './switch-verse'
import { ThermostatVerse } from './thermostat-verse'
import { AmbientSensorVerse } from './ambient-sensor-verse'
import { UnsupportedThingVerse } from './unsupported-thing-verse'

export const ThingVerse = ({ thing, setThing }) => {
	switch (thing.type) {
		case 'switch':
			return (<SwitchVerse thing={thing} setThing={setThing} />)
		case 'light':
			return (<LightVerse thing={thing} setThing={setThing} />)
		case 'thermostat':
			return (<ThermostatVerse thing={thing} setThing={setThing} />)
		case 'ambient-sensor':
			return (<AmbientSensorVerse thing={thing} setThing={setThing} />)
		default:
			return (<UnsupportedThingVerse thing={thing} />)
	}
}
