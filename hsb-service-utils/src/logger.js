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

const stackTraceFormatter = ({ formatErrorMessage }) => stack => {
    const [errorMessage, ...stackTraceLines] = stack.split('\n')
    return [
        `${chalk.gray(formatErrorMessage(errorMessage))}\n`,
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
    level >= 50
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
    logLevel = 'warn',
    displayLogLevel = true,
    prettyPrint = false,
}) =>
    pino({
        name: serviceName,
        level: logLevel,
        prettyPrint,
        prettifier: prettyPrint
            ? makePrettifier({
                formatName: nameFormatter({ bgColor: serviceColor }),
                formatLevel: displayLogLevel ? levelFormatter() : () => '',
                formatMessage: messageFormatter(),
                formatErrorMessage: errorMessageFormatter(),
                formatStackTrace: stackTraceFormatter({
                    formatErrorMessage: errorMessageFormatter()
                })
            })
            : undefined
    })
