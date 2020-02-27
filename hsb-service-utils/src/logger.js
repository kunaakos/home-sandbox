import pino from 'pino'
import chalk from 'chalk'
import upperFirst from 'lodash/upperFirst'

const nameFormatter = ({ bgColor }) => name => 
    chalk[`bg${upperFirst(bgColor)}`].black(name.padEnd(7).padStart(8))

const levelFormatter = () => level => {
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

const messageFormatter = () => msg =>
    msg
        .replace(/#(\S*)/g, (_, id) => chalk.blue(id))
        .replace(/'[^']*'/g, (betweenSingleQuotes) => chalk.cyan(betweenSingleQuotes))

const errorMessageFormatter = () => msg =>
    msg
        .replace(/#(\S*)/g, (_, id) => chalk.bold(id))

const stackTraceFormatter = () => stack => {
    const [errorMessage, ...stackTraceLines] = stack.split('\n')
    return [
        `${chalk.gray(errorMessageFormatter(errorMessage))}\n`,
        ...stackTraceLines.map(line => `      ${chalk.gray(line.trim())}\n`)
    ].join('')
}

const makePrettifier = ({
    formatName,
    formatLevel,
    formatMessage,
    formatErrorMessage,
    formatStackTrace
}) => () => ({
    name,
    level,
    msg,
    stack
}) =>
    `${
    stack ? '\n' : ''
    }${
    formatName && name
        ? formatName(name)
        : ''
    }${
    formatLevel(level)
    } ${
    stack
        ? chalk.red(formatErrorMessage(msg))
        : formatMessage(msg)
    }\n${
    stack
        ? formatStackTrace(stack)
        : ''
    }${
    stack ? '\n' : ''
    }`

export const makeLogger = ({
    serviceName,
    serviceColor,
    environment,
    forceLogLevel
}) =>
    pino({
        name: serviceName,
        ...(
            environment === 'production'
                ? {
                    level: forceLogLevel || 'warn'
                }
                : {
                    level: forceLogLevel || 'debug',
                    prettyPrint: true,
                    prettifier: makePrettifier({
                        formatName: nameFormatter({ bgColor: serviceColor }),
                        formatLevel: levelFormatter(),
                        formatMessage: messageFormatter(),
                        formatErrorMessage: errorMessageFormatter(),
                        formatStackTrace: stackTraceFormatter()
                    })
                }
        )
    })
