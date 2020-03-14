import React from 'react'
import ReactDOM from 'react-dom'

import { ThingsProvider } from '../hooks/use-things'
import { App } from '../components/app'

ReactDOM.render(
	<ThingsProvider>
		<App />
	</ThingsProvider>,
	document.getElementById('root')
)
