import { createLogger, config, transports, format } from 'winston'
import path from 'path'

const env = process.env.NODE_ENV
let options
let transportsToUse
if(env == "development"){
  options = {
    file: {
      level: 'info',
      filename: path.join(__dirname,'logs', 'app.log'),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  }
  transportsToUse = [
    new transports.File(options.file),
    new transports.Console(options.console)
  ]
}
else if (env == "production"){
  options = {
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  }
  transportsToUse = [
    new transports.Console(options.console)
  ]
}

const logger = createLogger({
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json()
  ),
  levels: config.npm.levels,
  transportsToUse,
  exitOnError: false
})

export default logger