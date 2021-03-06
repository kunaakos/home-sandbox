module.exports = {
	title: 'HSB STYLE',
	sections: [
		{
			name: 'getting wired',
			content: 'src/wired/docs/getting-wired.md',
		},
		{
			name: 'typography & colors',
			content: 'src/wired/docs/typography-and-colors.md',
		},
		{
			name: 'layout',
			content: 'src/wired/docs/layout.md',
		},
		{
			name: 'inputs',
			content: 'src/wired/docs/inputs.md',
		},
	],
	template: {
		title: 'HSB STYLE',
		head: {
			raw: '<style>html { font-size: 20px; }</style>',
			links: [
				{
					href: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;700&family=Roboto+Mono&display=swap',
					rel: 'stylesheet'
				}
			]
		},
	},
	styles: {
		Link: {
			link: {
				'&, &:link, &:visited': {
					textDecoration: 'underline',
				},
			},
		},
		StyleGuide: {
			root: {
				overflowX: 'hidden',
			}
		}
	},
	theme: {
		fontFamily: {
			base: ['Lato'],
			monospace: ['Roboto Mono', 'monospace']
		},
		fontSize: {
			base: 20,
			text: 20,
			small: 20,
			h1: 40,
			h2: 28,
			h3: 28,
			h4: 28,
			h5: 28,
			h6: 28,
		},
		color: {
			base: 'ghostwhite',
			light: 'ghostwhite',
			lightest: 'ghostwhite',
			link: 'ghostwhite',
			linkHover: 'ghostwhite',
			focus: 'rgba(22, 115, 177, 0.25)',
			border: 'ghostwhite',
			name: 'salmon',
			type: 'ghostwhite',
			error: 'red',
			baseBackground: 'black',
			codeBackground: 'black',
			sidebarBackground: 'black',
			ribbonBackground: 'black',
			ribbonText: 'ghostwhite',
			// Based on default Prism theme
			codeBase: '#333',
			codeComment: '#6d6d6d',
			codePunctuation: '#999',
			codeProperty: '#905',
			codeDeleted: '#905',
			codeString: '#690',
			codeInserted: '#690',
			codeOperator: '#9a6e3a',
			codeKeyword: '#1673b1',
			codeFunction: '#DD4A68',
			codeVariable: '#e90',
		}
	},
	serverPort: 6660
}