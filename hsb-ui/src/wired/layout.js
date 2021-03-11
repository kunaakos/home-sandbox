import styled from '@emotion/styled'

const MAX_SCROLL_WIDTH = `30rem`
const stripeWidth = ({ theme }) => `${theme.stripeWidthPx}px`
const spacer = ({ theme }) => `${theme.spacerRem}rem`

export const Scroll = styled.div`
	max-width: ${MAX_SCROLL_WIDTH};
	margin: calc(4 * ${spacer}) auto 0 auto;
    padding-right: ${spacer};
    padding-left: ${spacer};
	user-select: none;
`

export const Verse = styled.div`
	margin-bottom: calc(2 * ${spacer});
	opacity: ${({ dimmed }) => dimmed ? 0.6 : 1};
	${({ theme, color }) => color ? `color: ${theme.colors[color] || color}` : ''};
`

export const Stripe = styled.hr`
	width: 100vw;
	margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    overflow: hidden;
    border: none;
	border-bottom-width: ${stripeWidth};
	border-bottom-style: solid;
	border-bottom-color: inherit;
`

export const ShortStripe = styled.hr`
	width: 100%;
	margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    overflow: hidden;
    border: none;
	border-bottom-width: ${stripeWidth};
	border-bottom-style: solid;
	border-bottom-color: inherit;
`

export const Indent = styled.div`
	margin-left: calc(2 * ${spacer});
`

export const Arrange = styled.div`
	display: flex;
	${({ width, theme }) => width ? `width: ${width * theme.spacerRem}rem;` : ''}
	${({ height, theme }) => height ? `height: ${height * theme.spacerRem}rem;` : ''}
	justify-content: ${({ horizontally }) => {
		switch (horizontally) {
			case 'right':
				return 'flex-end'
			case 'left':
				return 'flex-start'
			case 'space-around':
				return 'space-around'
			case 'space-around':
				return 'space-around'
			default:
				return 'center'
		}
	}};

	align-items: ${({ vertically }) => {
		switch (vertically) {
			case 'bottom':
				return 'flex-end'
			case 'top':
				return 'flex-start'
			default:
				return 'center'
		}
	}}
`
