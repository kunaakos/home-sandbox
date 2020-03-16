import styled from '@emotion/styled'

export const Card = styled.div`
	position: relative;
	user-select: none;
	background: ${({ background, theme }) => theme.colors[background] || theme.colors.bg1};
	color: ${({ color, theme }) => theme.colors[color] || theme.colors.fg1};
	&:before {
		content: '';
		display: block;
		z-index: -1;
		background: ${({ highlight, theme }) => theme.colors[highlight] || 'none'};
		position: absolute;
		top: 0;
		left: -0.2rem;
		width: 0.2rem;
		height: 100%;
	}
`

export const CardContainer = styled.div`
	${Card} + ${Card} {
		margin-top: 1rem;
	}
`

export const CenteredCardContainer = styled(CardContainer)`
	width: calc(100% - 2rem);
	max-width: 420px;
	padding: 4rem 0 2rem 0;
	margin: auto;
`

export const TitleBar = styled.div`
	padding: 0.4rem 0 0.6rem 0.4rem;
`
