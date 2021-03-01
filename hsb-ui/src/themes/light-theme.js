export const lightTheme = {

	// stolen from Grommet palette: https://v2.grommet.io/color
	colors: {

		brand: '#7D4CDB',

		neutral1: '#00873D',
		accent1: '#6FFFB0',

		neutral2:'#3D138D',
		accent2: '#FD6FFF',

		neutral3: '#A2423D',
		accent3: '#FFCA58',

		ok: '#00C781',
		warn: '#FFAA15',
		error: '#FF4040',
		disabled: '#CCCCCC',

		bg1: '#F8F8F8',
		fg1: '#555555',
		bg2: '#DADADA',
		fg2: '#333333'

	},

	fonts: {
		title: 'sans-serif',
		text: 'sans-serif',
		controls: 'sans-serif'
	},

	fontSizes: {
		title: '2rem',
		heading: '1.4rem',
		subheading: '1.2rem',
		paragraph: '1rem'
	},

	misc: {
		transitionDuration: '100ms'
	}

}

const colors = lightTheme.colors

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
