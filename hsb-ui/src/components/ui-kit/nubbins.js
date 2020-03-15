import styled from '@emotion/styled'
import Slider from '@material-ui/core/Slider'

export const Button = styled.button`
	width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
	text-align: ${({ textAlign = 'center' }) => textAlign};
	user-select: none;
	background: ${({ background, theme }) => theme.colors[background] || theme.colors.brand};
	color: ${({ color, theme }) => theme.colors[color] || theme.colors.bg1};
	font-family: ${({ theme }) => theme.fonts.controls};
	font-size: ${({ fontSize = 'heading', theme }) => theme.fontSizes[fontSize]};
	text-transform: ${({ textTransform = 'none' }) => textTransform};
	padding: 0.2rem 0.6rem;
	border: none;
	&:focus,
	&:active {
		outline: none;
	}
`

export const Label = styled.div`
	box-sizing: border-box;
	width: ${({ fullWidth }) => fullWidth ? '100%' : 'fit-content'};
	text-align: ${({ textAlign = 'center' }) => textAlign};
	user-select: none;
	background: ${({ background, theme }) => theme.colors[background] || 'none'};
	color: ${({ color, theme }) => theme.colors[color] || theme.colors.fg1};
	font-family: ${({ theme }) => theme.fonts.controls};
	font-size: ${({ fontSize = 'heading', theme }) => theme.fontSizes[fontSize]};
	text-transform: ${({ textTransform = 'none' }) => textTransform};

	padding: 0.2rem 0.6rem;
`

export const VerticalButtonsContainer = styled.div`
	& > ${Button},
	& > ${Label} {
		display: block;
	}
	& > * + * {
		margin-top: 0.2rem;
	}
`

export const HorizontalButtonsContainer = styled.div`
	& > ${Button},
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