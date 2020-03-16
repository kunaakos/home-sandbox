import { Global, css } from '@emotion/core'
import styled from '@emotion/styled'
import { ThemeProvider } from 'emotion-theming'
import React from 'react'
import { useState } from 'react'
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from 'react-router-dom'

import { ThingsView } from './views/things-view'
import { UsersView } from './views/users-view'
import { GatewaysView } from './views/gateways-view'

import { lightTheme } from '../themes/light-theme'
import { useUserToken } from '../hooks/use-user-token'
import { DrawerMenu } from './ui-kit/menus'
import {
	Button,
	NavButton,
	HorizontalButtonsContainer,
	VerticalButtonsContainer
} from './ui-kit/nubbins'

const globalStyles = css`
	body, html {
		margin: 0;
	}
	#root {
		width: 100vw;
		height: 100vh;
		overflow-y: scroll;
	}
`

const HoverMenu = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	transform: translateX(${({ hide }) => hide ? 'calc(100% + 1rem)' : '0'});
    transition: transform ${({ theme }) => theme.misc.transitionDuration};
`

const HoverMenuButtonsContainer = styled(HorizontalButtonsContainer)`
	margin-top: 1rem;
	margin-right: 1rem;
`

const DrawerMenuButtonsContainer = styled(VerticalButtonsContainer)`
	margin: 1rem;
`

export const App = () => {

	useUserToken()

	const [drawerOpen, setDrawerOpen] = useState(false)
	const openDrawer = () => setDrawerOpen(true)
	const closeDrawer = () => setDrawerOpen(false)

	return (
		<ThemeProvider theme={lightTheme}>

			<Global styles={globalStyles} />

			<Router>

				<Switch>
					<Route exact path="/">
						<Redirect to="/things" />
					</Route>
					<Route path="/things">
						<ThingsView />
					</Route>
					<Route path="/gateways">
						<GatewaysView />
					</Route>
					<Route path="/users">
						<UsersView />
					</Route>
				</Switch>

				<HoverMenu hide={drawerOpen}>
					<HoverMenuButtonsContainer>
						<Button onClick={openDrawer}>+</Button>
					</HoverMenuButtonsContainer>
				</HoverMenu>

				<DrawerMenu
					isOpen={drawerOpen}
					close={closeDrawer}
				>
					<DrawerMenuButtonsContainer>
						<NavButton
							to="/things"
							onClick={closeDrawer}
						>
							Things
						</NavButton>
						<NavButton
							to="/gateways"
							onClick={closeDrawer}
						>
							Gateways
						</NavButton>
						<NavButton
							to="/users"
							onClick={closeDrawer}
						>
							Users
						</NavButton>
					</DrawerMenuButtonsContainer>
				</DrawerMenu>

			</Router>

		</ThemeProvider>
	)
}
