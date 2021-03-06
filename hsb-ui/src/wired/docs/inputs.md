Think of inputs as visual representations of a value that has a type, units, boundaries etc.
What's common in them is that they all have a track, and they only take up the space of that track in the document flow.
The best and standard way to display them is attached to a `Stripe` within a `Verse`.

## the trusty **Switch**:

```jsx noeditor
import { Switch } from '../inputs';
import { Arrange } from '../layout';

<Arrange height={4} vertically='center'>
	<Switch/>
</Arrange>
```

It's either on or off, and has a fixed width of 4 spacer units.

```jsx noeditor
import { Scroll, Verse, Stripe, Arrange } from '../layout';
import { Label, Highlight } from '../ui-kit';
import { Switch } from '../inputs';

const [switch1State, setSwitch1State] = React.useState(false);
const [switch2State, setSwitch2State] = React.useState(false);
const [switch3State, setSwitch3State] = React.useState(false);

<Scroll>
	<Verse>
		<Label>a switch <Highlight color='hotpink'>{switch1State ? 'ON' : 'OFF'}</Highlight></Label>
		<Stripe/>
		<Arrange vertically='top' horizontally='right'>
			<Switch state={switch1State} onChange={state => setSwitch1State(state)}/>
		</Arrange>
	</Verse>
	<Verse>
		<Label>another switch <Highlight color='hotpink'>{switch2State ? 'ON' : 'OFF'}</Highlight></Label>
		<Stripe/>
		<Arrange vertically='top' horizontally='right'>
			<Switch state={switch2State} onChange={state => setSwitch2State(state)}/>
		</Arrange>
	</Verse>
	<Verse>
		<Label>yet another switch <Highlight color='hotpink'>{switch3State ? 'ON' : 'OFF'}</Highlight></Label>
		<Stripe/>
		<Arrange vertically='top' horizontally='right'>
			<Switch state={switch3State} onChange={state => setSwitch3State(state)}/>
		</Arrange>
	</Verse>
</Scroll>
```

It could be better at displaying its current state and draggability (it's a button disguised as a switch).

## the humble **Slider**:

```jsx noeditor
import { Arrange } from '../layout';
import { Slider } from '../inputs';

<Arrange height={4} vertically='center'>
	<Slider/>
</Arrange>
```

These are used for quickly setting values within a predefined range, but are not for precise inputs. They will take up the entire width of their parent containers by default, but they also have a 'width' prop you can use for sizing.

```jsx noeditor
import { Scroll, Verse, Stripe, Arrange } from '../layout';
import { Heading, Paragraph, Label, Button, Dim, Highlight } from '../ui-kit';
import { Slider } from '../inputs';

const [warnSliderDisplayValue, setWarnSliderDisplayValue] = React.useState(50);
const [errorSliderDisplayValue, setErrorSliderDisplayValue] = React.useState(50);

<Scroll>
	<Verse>
		<Label>vagueness</Label>
		<Stripe/>
		<Arrange height={2}vertically='top' horizontally='right'>
			<Slider width='66%'/>
		</Arrange>
		<Paragraph><Dim>The simplest component built with a slider gives you no precise feedback about its current value, and it's great for contexts where the unit of measure is meaningless to the user or values imprecise.</Dim></Paragraph>
	</Verse>
	<Verse color={(warnSliderDisplayValue < 20) ? 'gold' : 'ghostWhite'}>
		<Label>joy <Highlight color='hotpink'>{warnSliderDisplayValue}&nbsp;%</Highlight></Label>
		<Stripe/>
		<Arrange height={2}vertically='top' horizontally='right'>
			<Slider width='66%' onChange={(value) => setWarnSliderDisplayValue(value)}/>
		</Arrange>
		<Paragraph><Dim>Will give you a warning if set to lower than 20%, this one.</Dim></Paragraph>
	</Verse>
	<Verse color={(errorSliderDisplayValue > 80) ? 'orangered' : 'ghostWhite'}>
		<Label>danger <Highlight color='hotpink'>{errorSliderDisplayValue}&nbsp;%</Highlight></Label>
		<Stripe/>
		<Arrange height={2} vertically='top' horizontally='right'>
			<Slider width='66%' value={errorSliderDisplayValue} onChange={(value) => setErrorSliderDisplayValue(value)}/>
		</Arrange>
		<Paragraph><Dim>And this one will signal an error if set to higher than 80%.</Dim></Paragraph>
	</Verse>
</Scroll>
```

Under the hood they're good ol' HTML range inputs, so expect them to fall apart in different browsers, because they're quite the beast to tame when it comes to styling them.

## the (un)reliable **Precise**:

```jsx noeditor
import { Arrange } from '../layout';
import { Precise } from '../inputs';

<Arrange height={4} vertically='center'>
	<Precise
		min={0}
		max={100}
		step={1}
		value={99}
		width={8}
		label={'problems'}
	/>
</Arrange>
```

**Precise** allows for... well... more precise control over values than a **Slider**. They can display many types of values and units, so you can set their width.

```jsx noeditor
import { Scroll, Verse, Stripe, Arrange } from '../layout';
import { Heading, Paragraph, Label, Button, Dim, Highlight } from '../ui-kit';
import { Precise } from '../inputs';

const [preciseValue, setPreciseValue] = React.useState(22.1);

<Scroll>
	<Verse color={(preciseValue > 25) ? 'gold' : 'ghostWhite'}>
		<Label>temperature</Label>
		<Stripe/>
		<Arrange height={2} vertically='top' horizontally='right'>
			<Precise width={6} min={0} max={30} step={0.5} value={preciseValue} label={'°C'} onChange={value => setPreciseValue(value)}/>
		</Arrange>
		<Paragraph><Dim>You can adjust the value by stepping or by editing directly. Setting it too high will trigger a warning.</Dim></Paragraph>
	</Verse>
	<Verse>
		<Label>the same temperature</Label>
		<Stripe/>
		<Arrange height={2} vertically='top' horizontally='right'>
			<Precise width={6} min={0} max={30} value={preciseValue} label={'°C'} onChange={value => setPreciseValue(value)}/>
		</Arrange>
		<Paragraph><Dim>Play around with these two to understand when Precise is actually updated.</Dim></Paragraph>
	</Verse>
</Scroll>
```

To be honest this is a side effect-ey imperative mess, the cursor jumps around if an invalid value was entered, it sometimes clears itself, those weird JS rounding bugs are very much a thing, validation is ass and who knows what else is wrong with it.

But it looks kinda neat.
