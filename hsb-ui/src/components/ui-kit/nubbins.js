import styled from '@emotion/styled'
import Slider from '@material-ui/core/Slider'
import { NavLink } from 'react-router-dom'

export const Button = styled.button`
	cursor: pointer;
	width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
	text-align: ${({ textAlign = 'center' }) => textAlign};
	user-select: none;
	background: ${({ background, theme }) => theme.colors[background] || theme.colors.brand};
	color: ${({ color, theme }) => theme.colors[color] || theme.colors.bg1};
	font-family: ${({ theme }) => theme.fonts.controls};
	font-size: ${({ fontSize = 'subheading', theme }) => theme.fontSizes[fontSize]};
	text-transform: ${({ textTransform = 'none' }) => textTransform};
	padding: 0.05rem 0.45rem;
	border: none;
	&:focus,
	&:active {
		outline: none;
	}
`

export const NavButton = styled(NavLink)`
	box-sizing: border-box;
	text-decoration: none;
	width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
	text-align: ${({ textAlign = 'center' }) => textAlign};
	user-select: none;
	&:not(.active) {
		background: ${({ background, theme }) => theme.colors[background] || theme.colors.brand};
		color: ${({ color, theme }) => theme.colors[color] || theme.colors.bg1};
	}
	&.active {
		background: ${({ activeBackground, theme }) => theme.colors[activeBackground] || theme.colors.accent2};
		color: ${({ activeColor, theme }) => theme.colors[activeColor] || theme.colors.bg1};
	}
	font-family: ${({ theme }) => theme.fonts.controls};
	font-size: ${({ fontSize = 'subheading', theme }) => theme.fontSizes[fontSize]};
	text-transform: ${({ textTransform = 'none' }) => textTransform};
	padding: 0.05rem 0.45rem;
`

export const Label = styled.div`
	box-sizing: border-box;
	width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
	text-align: ${({ textAlign = 'center' }) => textAlign};
	user-select: none;
	background: ${({ background, theme }) => theme.colors[background] || 'none'};
	color: ${({ color, theme }) => theme.colors[color] || theme.colors.fg1};
	font-family: ${({ theme }) => theme.fonts.controls};
	font-size: ${({ fontSize = 'subheading', theme }) => theme.fontSizes[fontSize]};
	text-transform: ${({ textTransform = 'none' }) => textTransform};
	padding: 0.05rem 0.45rem;
`
export const CardLabel = styled(Label)`
	margin-left: 1rem;
`

export const CopyPasta = styled.span`
	user-select: all;
`

export const CardButtons = styled.div`
	display: flex;
	justify-content: flex-end;
`

export const VerticalButtonsContainer = styled.div`
	& > ${Button},
	& > ${NavButton},
	& > ${Label} {
		display: block;
	}
	& > * + * {
		margin-top: 0.2rem;
	}
`

export const HorizontalButtonsContainer = styled.div`
	& > ${Button},
	& > ${NavButton},
	& > ${Label} {
		display: inline-block;
	}
	& > * + * {
		margin-left: 0.2rem;
	}
`

export const HorizontalSliderLabel = styled(Label)`
	padding-left: 0;
	margin-left: 4rem;
`

export const HorizontalSlider = styled(Slider)`
	&.MuiSlider-root {
		margin-left: 4rem;
		width: calc(100% - 4.5rem);
	} 
	& .MuiSlider-thumb {
		background: ${({ theme }) => theme.colors.fg1};
		width: 1.4rem;
		height: 1.4rem;
		margin-top: -0.6rem;
		margin-left: -0.2rem;
		&:focus,
		&:hover,
		&:active {
			box-shadow: inherit;
		}
	}

	& .MuiSlider-track {
		height: 0.2rem;
		color: ${({ theme }) => theme.colors.fg1};
	
	}
	& .MuiSlider-rail {
		height: 0.2rem;
		color: ${({ theme }) => theme.colors.disabled};
		&:after {
			content: '';
			display: block;
			height: 100%;
			width: 0.5rem;
			position: absolute;
			right: -0.5rem;
			background: ${({ theme }) => theme.colors.disabled};
		}
	}
`
