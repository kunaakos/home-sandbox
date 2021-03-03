import React from 'react'
import styled from '@emotion/styled'

const DrawerContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	transform: translateX(-100%);
`

const Drawer = styled.div`
	position: absolute;
	width: 80%;
	max-width: 480px;
	height: 100%;
	top: 0;
	right: 0;
	transform: translateX(${({ isOpen }) => isOpen ? '100%': '0'});
    transition: transform ${({ theme }) => theme.misc.transitionDuration};
	background: ${({theme}) => theme.colors.bg2};
	color: ${({theme}) => theme.colors.fg2};
`

const Overlay = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	right: 0;
	background: white;
	transform: translateX(${({ isOpen }) => isOpen ? '100%': '0'});
	opacity: ${({ isOpen }) => isOpen ? '0.8': '0'};
    transition: opacity ${({ theme }) => theme.misc.transitionDuration};
`

export const DrawerMenu = ({
	isOpen,
	close,
	children
}) => {

	return (
		<DrawerContainer>
			<Overlay
				isOpen={isOpen}
				onClick={() => close && close()}
			/>
			<Drawer isOpen={isOpen}>
				{children}
			</Drawer>
		</DrawerContainer>
	)

}
