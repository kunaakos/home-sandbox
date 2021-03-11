import React from 'react'

import {
	useState
} from 'react'

import {
	Verse,
	Label,
	Stripe,
	Arrange,
	Indent,
	Highlight,
	Paragraph
} from '../../wired'

const UNITS = {
	battery: '%',
	temperature: ' °C',
	humidity: '%',
	illuminance: ' Lux',
	moisture: '',
	fertility: ''
}

export const AmbientSensorVerse = ({ thing, setThing }) => {

	return (
		<Verse
			data-id={thing.id}
		>
			<Label>{thing.label}</Label>
			<Stripe/>
			<Arrange height={1} /> {/* this is nothing but vertical padding... */}
			<Indent>
				<Paragraph>
					{Object.entries(thing.state).map(
						([property, value]) =>
							<React.Fragment key={property}>
								<span>
									{property}:{' '}
									<Highlight color='output'>{value}{UNITS[property] || ''}</Highlight>
								</span>
								<br/>
							</React.Fragment>
					)}
				</Paragraph>
			</Indent>
		</Verse>
	)
}
