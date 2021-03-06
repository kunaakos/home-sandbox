import styled from '@emotion/styled'
import { SPACER } from './constants'

const MAX_SCROLL_WIDTH = `30rem`

export const Scroll = styled.div`
	max-width: ${MAX_SCROLL_WIDTH};
	margin: ${SPACER * 2}rem auto 0 auto;
	user-select: none;
`

export const Verse = styled.div`
	margin-bottom: ${SPACER * 2}rem;
	opacity: ${({ dimmed }) => dimmed ? 0.6 : 1};
	${({ color }) => color ? `color: ${color}` : ''};
`

export const Stripe = styled.hr`
	width: 100vw;
	margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    overflow: hidden;
    border: none;
	border-bottom-width: 2px;
	border-bottom-style: solid;
	border-bottom-color: inherit;
`

export const Arrange = styled.div`
	display: flex;
	${({ width }) => width ? `width: ${width * SPACER}rem;` : ''}
	${({ height }) => height ? `height: ${height * SPACER}rem;` : ''}
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
