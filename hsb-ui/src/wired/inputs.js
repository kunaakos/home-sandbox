import React from 'react'
import {
	useState,
	useEffect,
	useRef,
	useCallback
} from 'react'
import styled from '@emotion/styled'
import debounce from 'lodash/debounce'

import { Label, Highlight } from './ui-kit'
import { Arrange } from './layout'

const spacer = ({ theme }) => `${theme.spacerRem}rem`
const nubbinSize = ({ theme }) => `${theme.nubbinSizeRem}rem`
const trackWidth = ({ theme }) => `${theme.trackWidthPx}px`
const stripeWidth = ({ theme }) => `${theme.stripeWidthPx}px`
const inputColor = ({theme}) => theme.colors.input

const SwitchInput = styled.input`
	width: 0;
	height: 0;
	visibility: hidden;
`

const SwitchThumb = styled.label`
	cursor: pointer;
	width: calc(${nubbinSize} * 2);
	height: ${nubbinSize};
	display: block;
	position: absolute;
	top: calc(${spacer} * -0.3);
	&:after{
		content: '';
		display: block;
		position: absolute;
		top: 0;
		background: black;
		box-sizing: border-box;
		border: ${trackWidth} solid ${inputColor};
		height: ${nubbinSize};
		width: ${nubbinSize};
	}
`

const SwitchContainer = styled.div`
	-webkit-tap-highlight-color:transparent;
	position: relative;
	background: ${inputColor};
	width: calc(${nubbinSize} * 2);
	height: ${trackWidth};

	${SwitchInput}:checked + ${SwitchThumb}:after {
		transform: translateX(${nubbinSize});
	}
`

export const Switch = ({
	isOn: receivedIsOn,
	onChange
}) => {

	const inputRef = useRef()
	const [isOn, setIsOn] = useState(receivedIsOn)
	const [id,] = useState(`${Date.now()}_${Math.random() * 1000000}`) // all input+label pairs need unique ids


	useEffect(() => {
		if (isOn === receivedIsOn) { return }
		onChange && onChange(isOn)
	}, [isOn])

	useEffect(() => {
		if (receivedIsOn === isOn) { return }
		inputRef.current.checked = receivedIsOn
		setIsOn(receivedIsOn)
	}, [receivedIsOn])

	return (
		<SwitchContainer>
			<SwitchInput
				type="checkbox"
				id={id}
				defaultChecked={receivedIsOn}
				ref={inputRef}
				onChange={({ target: { checked } = {}}) => { onChange && onChange(checked)}}
			/>
			<SwitchThumb htmlFor={id}/>
		</SwitchContainer>
	)
}

const SliderInput = styled.input`
	-webkit-tap-highlight-color:transparent;
	/* bless the author of http://danielstern.ca/range.css/ */
	display: block;
	width: ${({ width }) => width || '100%'};
	margin: 0;
	background-color: transparent;
	-webkit-appearance: none;
	&:focus {
		outline: none;
	}
	&::-webkit-slider-runnable-track {
		background: ${inputColor};
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
		width: 100%;
		height: ${trackWidth};
		cursor: pointer;
	}
	&::-webkit-slider-thumb {
		margin-top: calc(${spacer} * -0.3);
		width: ${nubbinSize};
		height: ${nubbinSize};
		background: black;
		border: ${trackWidth} solid ${inputColor};
		border-radius: ${nubbinSize};
		cursor: pointer;
		-webkit-appearance: none;
	}
	&:focus::-webkit-slider-runnable-track {
		background: ${inputColor};
	}
	&::-moz-range-track {
		background: ${inputColor};
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
		width: 100%;
		height: ${trackWidth};
		cursor: pointer;
	}
	&::-moz-range-thumb {
		width: ${nubbinSize};
		height: ${nubbinSize};
		background: black;
		border: ${trackWidth} solid ${inputColor};
		border-radius: ${nubbinSize};
		cursor: pointer;
	}
	&::-ms-track {
		background: transparent;
		border-color: transparent;
		border-width: 14px 0;
		color: transparent;
		width: 100%;
		height: ${trackWidth};
		cursor: pointer;
	}
	&::-ms-fill-lower {
		background: ${inputColor};
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
	}
	&::-ms-fill-upper {
		background: ${inputColor};
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
	}
	&::-ms-thumb {
		width: ${nubbinSize};
		height: ${nubbinSize};
		background: black;
		border: ${trackWidth} solid ${inputColor};
		border-radius: ${nubbinSize};
		cursor: pointer;
		margin-top: 0px;
		/*Needed to keep the Edge thumb centred*/
	}
	&:focus::-ms-fill-lower {
		background: ${inputColor};
	}
	&:focus::-ms-fill-upper {
		background: ${inputColor};
	}
	/*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
	how to remove the vertical space around the range input in IE*/
	@supports (-ms-ime-align: auto) {
		/* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
		& {
			margin: 0;
			/*Edge starts the margin from the thumb, not the track as other browsers do*/
		}
	}
`

export const Slider = ({
	width,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	value: receivedValue
}) => {

	const inputRef = useRef()
	const [value, setValue] = useState(receivedValue)

	// NOTE: this is needed because of junk TRADFRI light state updates
	const debouncedSliderUpdate = useCallback(
		debounce(
			value => { inputRef.current.value = value },
			1000,
			{
				leading: false,
				trailing: true
			}
		),
		[]
	)

	useEffect(() => {
		if (value === receivedValue) { return }
		onChange && onChange(value)
	}, [value])

	useEffect(() => {
		if (receivedValue === value) { return }
		debouncedSliderUpdate(receivedValue)
		setValue(receivedValue)
	}, [receivedValue])

	const debouncedOnChange = useCallback(
		onChange
			? debounce(
				onChange,
				200,
				{
					leading: false,
					trailing: true
				}
			)
			: () => {},
		[onChange]
	)

	const onInputChange = ({ target: { value } = {}}) => { debouncedOnChange(Math.round(parseInt(value))) }

	return (
		<SliderInput
			type='range'
			width={width}
			min={min}
			max={max}
			step={step}
			ref={inputRef}
			defaultValue={receivedValue}
			onChange={onInputChange}
		/>
	)
}
	
const PreciseContainer = styled.div`
	-webkit-tap-highlight-color:transparent;
	position: relative;
	background: ${inputColor};
	width: ${({ width, theme }) => `${theme.spacerRem * width}rem`};
	height: ${trackWidth};
`

const PreciseValue = styled(Arrange)`
	position: absolute;
	bottom: calc(${trackWidth} + ${stripeWidth});
	color: ${inputColor};
`

const PreciseInputField = styled(Label)`
	outline: none;
`

const PreciseControls = styled(Arrange)`

`

const PreciseControl = styled(Label)`
	cursor: pointer;
	width: ${nubbinSize};
	color: ${inputColor};
	text-align: center;
`

// what this needs is unit tests and refactoring, and what I need is a drink
export const Precise = ({
	value: receivedValue,
	min = 0,
	max = 100,
	step = 1,
	label,
	width = 4,
	onChange
}) => {

	const inputRef = useRef()
	const [{
		last: value,
		editedValue
	}, setValues] = useState({
		last: receivedValue,
		editedValue: null
	})
	const isUserEditing = editedValue!== null && value !== editedValue

	useEffect(() => {
		if (value === receivedValue) { return }
		onChange && onChange(value)
	}, [value])

	useEffect(() => {
		if (receivedValue === value) { return }
		editedValue === null && setValues({
			last: receivedValue,
			editedValue
		})
	}, [receivedValue])

	const increment = () => {
		setValues({
			last: Math.min(value + step, max),
			editedValue
		})
	}
	const decrement = () => {
		setValues({
			last: Math.max(value - step, min),
			editedValue
		})
	}
	const commit = () => {
		setValues({
			last: editedValue,
			editedValue: null
		})
	}
	// TODO: if an update is received while editing and the user reverts: BUG. Needs refactor. L8rs.
	const revert = () => {
		setValues({
			last: value,
			editedValue: null
		})
	}

	// very side effect-ey, this one is
	const handleInputChange = () => {
		const userInput = inputRef.current.innerHTML
		const newEditedValue = parseFloat(userInput)
		if (
			(![
				`${newEditedValue}`,
				`${newEditedValue}.`,
				''
			].includes(userInput)) ||
			(newEditedValue > max) ||
			(newEditedValue < min)
		) {
			inputRef.current.innerHTML = editedValue
		} else {
			setValues({
				last: value,
				editedValue: newEditedValue || value
			})
		}
	}

	return (
		<PreciseContainer width={width}>
			<PreciseValue width={width} horizontally={'center'}>
				<PreciseInputField
					contentEditable={true}
					onInput={handleInputChange}
					onBlur={handleInputChange}
					dangerouslySetInnerHTML={{ __html: value }}
					ref={inputRef}
				>
				</PreciseInputField>
				<Label>&nbsp;{label}</Label>
			</PreciseValue>
			<PreciseControls width={width} horizontally={'center'}>
				{
					isUserEditing
						? <>
							<PreciseControl onClick={revert}><Highlight color='warn'>X</Highlight></PreciseControl>
							<PreciseControl onClick={commit}>OK</PreciseControl>
						</>
						: <>
							<PreciseControl onClick={decrement}>-</PreciseControl>
							<PreciseControl onClick={increment}>+</PreciseControl>
						</>
				}
			</PreciseControls>
		</PreciseContainer>
	)
}
