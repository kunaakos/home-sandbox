import { Global, css } from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'
import { useState } from 'react'

import { ThemeProvider } from 'emotion-theming'
import { lightTheme } from '../themes/light-theme'

import { useThings } from '../hooks/use-things'
import { useUserToken } from '../hooks/use-user-token'

import { ThingCard } from '../components/thing-cards'

import { CardContainer } from './ui-kit/cards'
import { DrawerMenu } from './ui-kit/menus'
import {
	Button,
	Label,
	HorizontalButtonsContainer,
	VerticalButtonsContainer
} from './ui-kit/buttons'

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

const ThingCardContainer = styled(CardContainer)`
	margin: 2rem 1rem;
`

export const App = () => {

	useUserToken()
	const { connected, things, setThing } = useThings()

	const [drawerOpen, setDrawerOpen] = useState(false)
	const openDrawer = () => setDrawerOpen(true)
	const closeDrawer = () => setDrawerOpen(false)

	const visibleThings = connected && things
		? Object
			.values(things)
			.filter(thing => !thing.hidden)
		: []

	return (
		<ThemeProvider theme={lightTheme}>

			<Global styles={globalStyles} />

			<ThingCardContainer>
				{visibleThings.map(thing => <ThingCard key={thing.id} thing={thing} setThing={setThing} />)}
			</ThingCardContainer>

			<HoverMenu hide={drawerOpen}>
				<HoverMenuButtonsContainer>
					<Label>Things</Label>
					<Button onClick={openDrawer}>+</Button>
				</HoverMenuButtonsContainer>
			</HoverMenu>

			<DrawerMenu
				isOpen={drawerOpen}
				close={closeDrawer}
			>
				<DrawerMenuButtonsContainer>
					<Button onClick={closeDrawer}>Things</Button>
				</DrawerMenuButtonsContainer>
			</DrawerMenu>

		</ThemeProvider>
	)
}
