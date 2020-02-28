/**
 * A watchdog timer.
 * Initializes in a timed out state and starts after the first pet() call.
 * If @selfReset is enabled, it will restart the timer on timeout.
 * It's similar to setTimeout with @selfReset off, and to setInterval with @setReset on,
 * but timers can be reset with a `pet` call.
 * It will vall @onTimedOut when it times out (duh), and its timedOut state  can be
 * checked with a 'timedOut' call.
 */

export const makeWatchdog = ({
	interval,
	selfReset,
	onTimedOut: callback
}) => {

	let handle = null
	let timedOut = true

	const onTimedOut = () => {
		if (selfReset) {
			start()
		} else {
			timedOut = true
		}
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
