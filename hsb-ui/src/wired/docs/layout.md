Layout is as simple as it gets: a centered, narrow **Scroll**.

A series (list) of **Verse**s are rendered in Scrolls.

```jsx noeditor
import { Scroll, Verse, Stripe } from '../layout';
import { Paragraph, Label, Button, Highlight, Dim } from '../ui-kit';

<Scroll>
	<Verse>
		<Label>this is an example verse</Label>
		<Stripe/>
		<Paragraph>It's active and it's doing fine.</Paragraph>
	</Verse>
	<Verse color='gold'>
		<Label>this is another verse</Label>
		<Stripe/>
		<Paragraph>It needs your attention.</Paragraph>
	</Verse>
	<Verse dimmed>
		<Label>yet another verse</Label>
		<Stripe/>
		<Paragraph>
			This one is not active, but has a long description about cats. Cats like to chew on cables, sit on your face and sleep on towels you just washed and smell like lavender afterwards.
		</Paragraph>
	</Verse>
</Scroll>

```
