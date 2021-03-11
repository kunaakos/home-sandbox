export const wiredDarkTheme = {

	colors: {

		brand: 'lightseagreen', // pre-wired

		neutral1: 'dodgerblue', // pre-wired
		accent1: 'dodgerblue', // pre-wired

		neutral2: 'lightseagreen', // pre-wired
		accent2: 'lightseagreen', // pre-wired

		neutral3: 'hotpink', // pre-wired
		accent3: 'hotpink', // pre-wired

		ok: 'lighseagreen', // pre-wired
		warn: 'gold', // pre-wired
		error: 'orangered', // pre-wired
		disabled: '#CCCCCC', // pre-wired

		bg1: 'black', // pre-wired
		fg1: 'ghostwhite', // pre-wired
		bg2: 'black', // pre-wired
		fg2: 'ghostwhite', // pre-wired

		input: 'lightseagreen',
		output: 'hotpink',
		ui: 'dodgerblue',
		warning: 'gold',
		error: 'orangered',
		bg: 'black',
		fg: 'ghostwhite' ,
	},

	fonts: {
		title: 'Lato', // pre-wired
		text: 'Lato', // pre-wired
		controls: 'Lato' // pre-wired
	},

	fontSize: {
		titleRem: '2',
		headingRem: '1.4',
		textRem: '1',
	},
		
	fontSizes: {
		title: '2rem', // pre-wired
		heading: '1.4rem', // pre-wired
		subheading: '1.2rem', // pre-wired
		paragraph: '1rem', // pre-wired
	},

	spacerRem: '1',
	nubbinSizeRem: '2',
	trackWidthPx: '2',
	stripeWidthPx: '2',

	transitionDurationMs: '100',
	
	misc: {
		transitionDuration: '100ms' // pre-wired
	}

}

const colors = wiredDarkTheme.colors

export const editorColors = {
	default: colors.fg1,
	background: colors.bg1,
	background_warning: colors.warn,
	string: colors.neutral3,
	number: colors.neutral2,
	colon: colors.fg1,
	keys: colors.neutral1,
	keys_whiteSpace: colors.neutral2,
	primitive: colors.neutral2
}
