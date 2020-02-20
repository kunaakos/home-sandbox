/**
 * A simple watchdog timer.
 * Initializes in a timed out state and starts after the first pet() call.
 */

export const makeWatchdog = ({
	interval,
	onTimedOut: callback
}) => {

	let handle = null
	let timedOut = true

	const onTimedOut = () => {
		timedOut = true
		callback()
	}

	const stop = () => {
		clearTimeout(handle)
	}

	const start = () => {
		handle = setTimeout(onTimedOut, interval)
	}

	const pet = () => {
		timedOut = false
		stop()
		start()
	}

	return {
		pet,
		stop,
		timedOut: () => timedOut
	}
}
