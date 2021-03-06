


Let's switch over to wire components and render some text to talk about text!

```jsx noeditor
	import { Title, Heading, Paragraph, Link, Highlight } from '../ui-kit';
	<>
		<Paragraph>Typesetting is simple: titles, headings, subheadings, paragraphs and emphasis.</Paragraph>
		<Title>titles are titles</Title>
		<Heading>headings are headings</Heading>
		<Paragraph>Paragraphs are large-ish bodies of text. They're white most of the time, might have <Link href='#'>links</Link> embedded in them, and should not contain any colors &mdash; except if the text contains an <Highlight color='orangered'>error message</Highlight> or a <Highlight color='gold'>warning</Highlight>.</Paragraph>
		<Heading>what about colors?</Heading>
		<Paragraph>HTML color names are currently used for simplicity and because they already have clearly defined names. This will change once theming is introduced.</Paragraph>
		<Paragraph>Backgrounds are always <Highlight color='black'>`black`</Highlight> (that was black in case you can't tell), and text is `ghostwhite` by default.</Paragraph>
		<Paragraph>You've seen <Highlight color='orangered'>`orangered`</Highlight> used for errors, and <Highlight color='gold'>`gold`</Highlight> for warnings &mdash; these are standard. An OK status is the default color, no need to call any attention to it.</Paragraph>
		<Paragraph>For anything else, feel free to use the cold <Highlight color='dodgerblue'>`dodgerblue`</Highlight>, the lukewarm <Highlight color='lightseagreen'>`lightseagreen`</Highlight> or the very hot <Highlight color='hotpink'>`hotpink`</Highlight>. Always think about temperature: the more important/higher priority the information, the warmer/stronger the rendering of it.</Paragraph>
		<Paragraph>And make it burn retinas a bit, that's fine.</Paragraph>
	</>
```

That's it that's all, as you can see we seamlessly switched back to regular guide Markdown text. You'll see more seamless transitions between guide content and live components, and if it doesn't look and feel like that, the guide should be fixed.
