import React from 'react'

import { LightCard } from './light-card'
import { SwitchCard } from './switch-card'
import { ThermostatCard } from './thermostat-card'
import { AmbientSensorCard } from './ambient-sensor-card'
import { UnsupportedThingCard } from './unsupported-thing-card'

export const ThingCard = ({ thing, setThing }) => {
	switch (thing.type) {
		case 'switch':
			return (<SwitchCard thing={thing} setThing={setThing} />)
		case 'light':
			return (<LightCard thing={thing} setThing={setThing} />)
		case 'thermostat':
			return (<ThermostatCard thing={thing} setThing={setThing} />)
		case 'ambient-sensor':
			return (<AmbientSensorCard thing={thing} setThing={setThing} />)
		default:
			return (<UnsupportedThingCard thing={thing} />)
	}
}
