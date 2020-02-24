import pino from 'pino'
import chalk from 'chalk'

const prettifyLevel = level => {
	switch (level) {
		case 10:
			return chalk.bgGray.black(' TRC ')
		case 20:
			return chalk.bgGray(' DBG ')
		case 30:
			return chalk.gray.bgGreen(' INF ')
		case 40:
			return chalk.gray.bgYellow(' WRN ')
		case 50:
			return chalk.gray.bgRed(' ERR ')
		case 60:
			return chalk.gray.bgRed(' ✖╭╮✖ ')
		default:
			return chalk.bgMagenta(' ??? ')
	}
}

const formatMessage = msg =>
	msg
		.replace(/#(\S*)/g, (_, id) => chalk.blue(id))
		.replace(/'[^']*'/g, (betweenSingleQuotes) => chalk.cyan(betweenSingleQuotes))

const formatErrorMessage = msg =>
	msg.replace(/#(\S*)/g, (_, id) => chalk.bold(id))

const formatStackTraceLine = line =>
	`      ${chalk.gray(line.trim())}\n`

const prettifyStackTrace = stack => {
	const [errorMessage, ...stackTraceLines] = stack.split('\n')
	return [
		`${chalk.gray(formatErrorMessage(errorMessage))}\n`,
		...stackTraceLines.map(formatStackTraceLine),
		'\n'
	].join('')
}

const prettifier = () => ({
	level,
	msg,
	stack
}) =>
	`${
		stack ? '\n' : ''
	}${
		prettifyLevel(level)
	} ${
		stack
			? chalk.red(formatErrorMessage(msg))
			: formatMessage(msg)
	}\n${
		stack
			? prettifyStackTrace(stack)
			: ''
	}`


const getLoggerOptions = ({ NODE_ENV, LOG_LEVEL }) => {

	switch (NODE_ENV) {

		case 'production':
			return {
				level: LOG_LEVEL || 'warn'
			}

		case 'staging':
			return {
				level: LOG_LEVEL || 'warn'
			}

		default:
			return {
				level: LOG_LEVEL || 'debug',
				prettyPrint: true,
				prettifier
			}

		}

}

export const logger = pino(getLoggerOptions(process.env))
