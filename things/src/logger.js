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
			return chalk.bgRed(' ERR ')
		default:
			return chalk.bgMagenta(' ??? ')
	}
}

const prettifyMessage = msg =>
	msg
		.replace(/#(\S*)/g, (_, id) => chalk.blue(id))
		.replace(/'[^']*'/g, (betweenSingleQuotes) => chalk.cyan(betweenSingleQuotes))

const prettifyStackTrace = stack =>
	`\n${
	stack
		.split('\n')
		.slice(1)// the first line is the message, not needed
		.map(line => `      ${chalk.red(line.trim())}`) // indentation 
		.join('\n')
	}`

const prettifier = () => ({
	level,
	msg,
	stack
}) =>
	`${prettifyLevel(level)} ${prettifyMessage(msg)}${stack ? prettifyStackTrace(stack) : ''}\n`


const getLoggerOptions = ({ ENV, LOGLEVEL }) => {

	switch (ENV) {
		case 'production':
			return {
				level: LOGLEVEL || 'info'
			}

		default:
			return {
				level: LOGLEVEL || 'debug',
				prettyPrint: true,
				prettifier
			}
	}

}

export const logger = pino(getLoggerOptions(process.env))
