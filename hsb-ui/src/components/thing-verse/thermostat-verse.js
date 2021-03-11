import React from 'react'

import {
	useState,
	useEffect
} from 'react'

import {
	Verse,
	Label,
	Stripe,
	Arrange,
	Indent,
	Precise,
	Highlight,
	Paragraph
} from '../../wired'

export const ThermostatVerse = ({ thing, setThing }) => {

	const [targetTemperature, setTargetTemperature] = useState(thing.state.targetTemperature)

	useEffect(() => {
		setTargetTemperature(thing.state.targetTemperature)
	}, [thing.state.targetTemperature])

	return (
		<Verse
			data-id={thing.id}
			color={thing.state.timedOut ? 'warn' : 'fg'}
		>
				<Label>{thing.label}</Label>
				<Stripe/>
				<Arrange height={2} vertically='top' horizontally='right'>
					<Precise
						min={0}
						max={30}
						step={0.5}
						width={5}
						value={targetTemperature}
						label={'°C'} onChange={value => setThing(thing.id, { targetTemperature: value })}
					/>
				</Arrange>
				<Indent>
					<Paragraph>
						Current temperature&nbsp;is&nbsp;<Highlight color='output'>{thing.state.currentTemperature}&nbsp;°C</Highlight>
						{' '}and heat&nbsp;is&nbsp;<Highlight color='output'>{thing.state.heatRequest ? 'ON' : 'OFF'}</Highlight>
						{thing.state.timedOut && <>, because this thermostat hasn't received a temperature update in a while</>}.
					</Paragraph>
				</Indent>
		</Verse>
	)
}
