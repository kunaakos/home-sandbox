import {
	Global,
	css,
	useTheme,
	ThemeProvider
} from '@emotion/react'
import styled from '@emotion/styled'
import React from 'react'
import { useState } from 'react'
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from 'react-router-dom'

import { wiredDarkTheme } from '../themes/wired-dark'

import { useAuth } from '../hooks/use-auth'

import { LoginView } from './views/login-view'
import { OnboardingView } from './views/onboarding-view'
import { UsersView } from './views/users-view'
import { ThingsView } from './views/things-view'
import { GatewaysView } from './views/gateways-view'
import { AutomationsView } from './views/automations-view'

import { DrawerMenu } from './ui-kit/menus'
import { Label } from './ui-kit/nubbins'
import { CenteredCardContainer } from './ui-kit/cards'
import {
	Button,
	NavButton,
	HorizontalButtonsContainer,
	VerticalButtonsContainer
} from './ui-kit/nubbins'

const GlobalStyles = () => {
	const theme = useTheme()
	return (
	  	<Global styles={css`
			html {
				background: ${theme.colors.bg};
				color: ${theme.colors.fg};
				font-size: 20px;
			}
			body {
				margin: 0;
			}
			#root {
				overflow-x: hidden;
			}
			@font-face {
				font-family: 'Lato';
				font-weight: 300;
				src: url('/Lato-Light.ttf') format('truetype');
			}
			@font-face {
				font-family: 'Lato';
				font-weight: 700;
				src: url('/Lato-Bold.ttf') format('truetype');
			}
			`}
		/>
	)
}

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
	const isAdmin = Boolean(auth.currentUser && auth.currentUser.privileges && auth.currentUser.privileges.length && auth.currentUser.privileges.includes('admin'))

	return (
		<ThemeProvider theme={wiredDarkTheme}>

			<GlobalStyles />

			<Router>
				{auth.status === 'loading' && <></>}
				{auth.status === 'error' && <>
					<CenteredCardContainer>
						<Label>Something went wrong :(</Label>
					</CenteredCardContainer>
				</>}

				{auth.status === 'unauthenticated' && <>
					<Switch>
						<Route exact path='/'>
							{auth.redirectToOnboard && <Redirect to={`/onboarding/${auth.redirectToOnboard}`} />}
							{!auth.redirectToOnboard && <LoginView login={auth.login}/>}
						</Route>
						<Route exact path='/onboarding/:idUser'>
							<OnboardingView />
						</Route>
						<Route path='*'>
							<Redirect to='/' />
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

						<Route exact path='/'>
							<ThingsView />
						</Route>

						{isAdmin && <>
							<Route exact path='/gateways'>
								<GatewaysView />
							</Route>

							<Route exact path='/automations'>
								<AutomationsView />
							</Route>

							<Route exact path='/users'>
								<UsersView />
							</Route>
						</>}

						<Route path='*'>
							<Redirect to='/' />
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
								exact to='/'
								onClick={closeDrawer}
							>
								Things
							</NavButton>

							{isAdmin && <>
								<NavButton
									to='/gateways'
									onClick={closeDrawer}
								>
									Gateways
								</NavButton>
								<NavButton
									to='/automations'
									onClick={closeDrawer}
								>
									Automations
								</NavButton>
								<NavButton
									to='/users'
									onClick={closeDrawer}
								>
									Users
								</NavButton>
							</>}
						</DrawerMenuButtonsContainer>
					</DrawerMenu>
				
				</>}

			</Router>

		</ThemeProvider>
	)
}
