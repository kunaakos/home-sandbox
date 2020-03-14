import styled from '@emotion/styled'

export const Button = styled.button`
	user-select: none;
	background: ${({ theme }) => theme.colors.brand};
	color: ${({ theme }) => theme.colors.bg1};
	font-family: ${({ theme }) => theme.fonts.controls};
	font-size: ${({ theme}) => theme.fontSizes.heading};
	text-transform: uppercase;
	padding: 0.2rem 0.6rem;
	border: none;
	&:focus,
	&:active {
		outline: none;
	}
`

export const Label = styled.div`
	width: fit-content;
	user-select: none;
	background: ${({ theme }) => theme.colors.disabled};
	color: ${({ theme }) => theme.colors.bg1};
	font-family: ${({ theme }) => theme.fonts.controls};
	font-size: ${({ theme }) => theme.fontSizes.heading};
	text-transform: uppercase;
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
