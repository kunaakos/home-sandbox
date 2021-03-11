import styled from '@emotion/styled'

const spacer = ({ theme }) => `${theme.spacerRem}rem`
const titleFontSize = ({ theme }) => `${theme.fontSize.titleRem}rem`
const headingFontSize = ({ theme }) => `${theme.fontSize.headingRem}rem`
const textFontSize = ({ theme }) => `${theme.fontSize.textRem}rem`

/**
 * Try using only one title per screen.
 */
export const Title = styled.h1`
	font-family: 'Lato', sans-serif;
	font-weight: 300;
	font-size: ${titleFontSize};
	color: inherit;
	display: block;
	margin: 0 0 ${spacer} 0;
`

/**
 * Headings are great for section titles.
 */
export const Heading = styled.h2`
	font-family: 'Lato', sans-serif;
	font-weight: 300;
	font-size: ${headingFontSize};
	color: inherit;
	display: block;
	margin: 0;
	margin: 0 0 ${spacer} 0;
`

/**
 * A paragraph is a paragraph.
 */
export const Paragraph = styled.p`
	font-family: 'Lato', sans-serif;
	font-weight: 300;
	font-size: ${textFontSize};
	color: inherit;
	display: block;
	margin: 0;
	margin: 0 0 ${spacer} 0;
`

export const TextBlock = styled.div`
`

/**
 * And a link is a link. Don't use them for navigation and actions though, that's what `Action`s are for.
 * Links are always in bodies text.
 */
export const Link = styled.a`
	color: inherit;
`

/**
 * `Highlight` is the only way you should colorize text.
 * NOTE: this is not a good name, because it should be used in combination with `Dim`.
 * @param color color
 */
export const Highlight = styled.span`
	color: ${({ theme, color }) => theme.colors[color] || color };
`

/**
 * `Dim` can be used for displaying anything inactive, unavailable, disabled.
 */
export const Dim = styled.span`
	opacity: 0.6;
`

/**
 * Think of it as a button or a link: something that will trigger an action.
 */
export const Action = styled.button`
	font-family: 'Lato', sans-serif;
	font-weight: 300;
	color: inherit;
	font-size: ${headingFontSize};
`

/**
 * A label is the same size as a button, but not actionable.
 */
export const Label = styled.div`
	font-family: 'Lato', sans-serif;
	font-weight: 300;
	color: inherit;
	font-size: ${headingFontSize};
`

/**
 * Small label, smaller than a button.
 */
export const SmallLabel = styled.div`
	font-family: 'Lato', sans-serif;
	font-weight: 300;
	color: inherit;
	font-size: ${textFontSize};
`
