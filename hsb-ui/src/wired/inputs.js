import React from 'react'
import {
	useState,
	useEffect,
	useRef
} from 'react'
import styled from '@emotion/styled'

import { SPACER } from './constants'
import { Label, Highlight } from './ui-kit'
import { Arrange } from './layout'

const SwitchInput = styled.input`
	width: 0;
	height: 0;
	visibility: hidden;

`

const SwitchThumb = styled.label`
	cursor: pointer;
	width: ${SPACER * 4}rem;
	height: ${SPACER * 2}rem;
	display: block;
	position: absolute;
	top: -${SPACER / 4}rem;
	&:after{
		content: '';
		display: block;
		position: absolute;
		top: 0;
		background: black;
		box-sizing: border-box;
		border: 2px solid lightseagreen;
		height: ${SPACER * 2}rem;
	}
`

const SwitchContainer = styled.div`
	position: relative;
	background: lightseagreen;
	width: ${SPACER * 4}rem;
	height: 3px;

	${SwitchInput}:not(:active):checked + ${SwitchThumb}:after {
		transform: translateX(${SPACER * 2}rem);
	}

	${SwitchThumb}:not(:active):after {
		width: ${SPACER * 2}rem;
	}

	${SwitchThumb}:active:after {
		width: ${SPACER * 4}rem;
	}
`

export const Switch = ({
	isOn,
	onChange
}) => {

	// they all need unique ids
	const [id,] = useState(`${Date.now()}_${Math.random() * 1000000}`)

	return (
		<SwitchContainer>
			<SwitchInput
				type="checkbox"
				id={id}
				checked={isOn}
				onChange={({ target: { checked } = {}}) => { onChange && onChange(checked)}}
			/>
			<SwitchThumb htmlFor={id}/>
		</SwitchContainer>
	)
}

const SliderInput = styled.input`
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
		background: lightseagreen;
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
		width: 100%;
		height: 3px;
		cursor: pointer;
	}
	&::-webkit-slider-thumb {
		margin-top: -${SPACER / 4}rem;
		width: ${SPACER * 2}rem;
		height: ${SPACER * 2}rem;
		background: black;
		border: 2px solid lightseagreen;
		border-radius: ${SPACER * 2}rem;
		cursor: pointer;
		-webkit-appearance: none;
	}
	&:focus::-webkit-slider-runnable-track {
		background: lightseagreen;
	}
	&::-moz-range-track {
		background: lightseagreen;
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
		width: 100%;
		height: 3px;
		cursor: pointer;
	}
	&::-moz-range-thumb {
		width: ${SPACER * 2}rem;
		height: ${SPACER * 2}rem;
		background: black;
		border: 1px solid lightseagreen;
		border-radius: ${SPACER * 2}rem;
		cursor: pointer;
	}
	&::-ms-track {
		background: transparent;
		border-color: transparent;
		border-width: 14px 0;
		color: transparent;
		width: 100%;
		height: 3px;
		cursor: pointer;
	}
	&::-ms-fill-lower {
		background: lightseagreen;
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
	}
	&::-ms-fill-upper {
		background: lightseagreen;
		border: 0px solid rgba(0, 0, 0, 0);
		border: 0;
	}
	&::-ms-thumb {
		width: ${SPACER * 2}rem;
		height: ${SPACER * 2}rem;
		background: black;
		border: 2px solid lightseagreen;
		border-radius: ${SPACER * 2}rem;
		cursor: pointer;
		margin-top: 0px;
		/*Needed to keep the Edge thumb centred*/
	}
	&:focus::-ms-fill-lower {
		background: lightseagreen;
	}
	&:focus::-ms-fill-upper {
		background: lightseagreen;
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
	value
}) =>
	<SliderInput
		type='range'
		width={width}
		min={min}
		max={max}
		step={step}
		value={value}
		onChange={({ target: { value } = {}}) => { onChange && onChange(value)}}
	/>

const PreciseContainer = styled.div`
	position: relative;
	background: lightseagreen;
	width: ${({ width }) => `${SPACER * width}rem`};
	height: 3px;
`

const PreciseValue = styled(Arrange)`
	position: absolute;
	bottom: 4px;
	color: hotpink;
`

const PreciseInputField = styled(Label)`
	outline: none;
`

const PreciseControls = styled(Arrange)`

`

const PreciseControl = styled(Label)`
	cursor: pointer;
	width: ${SPACER * 2}rem;
	color: lightseagreen;
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
			(`${newEditedValue}` !== userInput && `${newEditedValue}.` !== userInput) ||
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
		<PreciseContainer>
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
							<PreciseControl onClick={revert}><Highlight color='orange'>X</Highlight></PreciseControl>
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
