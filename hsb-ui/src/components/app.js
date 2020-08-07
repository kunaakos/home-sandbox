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

import { useAuth } from '../hooks/use-auth'

import { LoginView } from './views/login-view'
import { UsersView } from './views/users-view'
import { ThingsView } from './views/things-view'
import { GatewaysView } from './views/gateways-view'

import { lightTheme } from '../themes/light-theme'
import { DrawerMenu } from './ui-kit/menus'
import { Label } from './ui-kit/nubbins'

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
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow-y: scroll;
		overflow-x: hidden;
	}
`

const HoverMenu = styled.div`
	position: fixed;
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

const ProtectedRoute = ({ children, allowIf, redirectTo, ...rest }) => {
	return (
		<Route
			{...rest}
			render={({ location }) =>
				allowIf
					? (children)
					: (
						<Redirect
							to={{
								pathname: redirectTo,
								state: { from: location }
							}}
						/>
					)
			}
		/>
	)
}


export const App = () => {

	const auth = useAuth()
	const isAuthenticated = auth.status === 'authenticated'

	const [drawerOpen, setDrawerOpen] = useState(false)
	const openDrawer = () => setDrawerOpen(true)
	const closeDrawer = () => setDrawerOpen(false)

	return (
		<ThemeProvider theme={lightTheme}>
			<Global styles={globalStyles} />

			<Router>

				{auth.status === 'loading'
					? <Label></Label>
					: <Switch>

						<ProtectedRoute
							path="/login"
							allowIf={!isAuthenticated}
							redirectTo={"/"}
						>
							<LoginView
								auth={auth}
							/>
						</ProtectedRoute>

						<ProtectedRoute
							exact path="/"
							allowIf={isAuthenticated}
							redirectTo={"/login"}
						>
							<ThingsView />
						</ProtectedRoute>

						<ProtectedRoute
							path="/gateways"
							allowIf={isAuthenticated}
							redirectTo={"/login"}
						>
							<GatewaysView />
						</ProtectedRoute>

						<ProtectedRoute
							path="/users"
							allowIf={isAuthenticated}
							redirectTo={"/login"}
						>
							<UsersView />
						</ProtectedRoute>

						<Route path="*">
							<Redirect to="/" />
						</Route>

					</Switch>
				}

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
							to="/"
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
