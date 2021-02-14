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
import { OnboardingView } from './views/onboarding-view'
import { UsersView } from './views/users-view'
import { ThingsView } from './views/things-view'
import { GatewaysView } from './views/gateways-view'

import { lightTheme } from '../themes/light-theme'
import { DrawerMenu } from './ui-kit/menus'
import { Label } from './ui-kit/nubbins'
import { CenteredCardContainer } from './ui-kit/cards'
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

	const [drawerOpen, setDrawerOpen] = useState(false)
	const openDrawer = () => setDrawerOpen(true)
	const closeDrawer = () => setDrawerOpen(false)

	const isActive = auth.status === 'authenticated' && auth.currentUser.status === 'active'
	const isInactive = auth.status === 'authenticated' && auth.currentUser.status !== 'active'

	return (
		<ThemeProvider theme={lightTheme}>
			<Global styles={globalStyles} />

			<Router>
				{auth.status === 'loading' && <></>}
				{auth.status === 'error' && <>
					<CenteredCardContainer>
						<Label>Something went wrong :(</Label>
					</CenteredCardContainer>
				</>}

				{auth.status === 'unauthenticated' && <>
					<Switch>
						<Route exact path="/">
							{auth.redirectToOnboard && <Redirect to={`/onboarding/${auth.redirectToOnboard}`} />}
							{!auth.redirectToOnboard && <LoginView login={auth.login}/>}
						</Route>
						<Route exact path="/onboarding/:idUser">
							<OnboardingView />
						</Route>
						<Route path="*">
							<Redirect to="/" />
						</Route>
					</Switch>
				</>}

				{isInactive && <>
					<CenteredCardContainer>
						<Label>Your account is not active :(</Label>
					</CenteredCardContainer>
				</>}

				{isActive && <>
					<Switch>

						<Route exact path="/">
							<ThingsView />
						</Route>

						<Route exact path="/gateways">
							<GatewaysView />
						</Route>

						<Route exact path="/users">
							<UsersView />
						</Route>

						<Route path="*">
							<Redirect to="/" />
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
								exact to="/"
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
				
				</>}

			</Router>

		</ThemeProvider>
	)
}
