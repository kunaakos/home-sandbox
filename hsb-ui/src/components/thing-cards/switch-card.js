import React from 'react'

export const SwitchCard = ({ thing, setThing }) => (
	<div data-id={thing.id}>
		<h3>🔌 {thing.label}</h3>
		<p>
			It's {thing.isOn ? 'on ✅' : 'off ❌'}. I can {
				thing.isOn
					? (<button onClick={() => { setThing(thing.id, { isOn: false }) }}>switch it off</button>)
					: (<button href="#" onClick={() => { setThing(thing.id, { isOn: true }) }}>turn it on</button>)
			} for you.
		</p>
	</div>
)
