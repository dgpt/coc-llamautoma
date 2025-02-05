import { window, OutputChannel } from 'coc.nvim'

class Logger {
  private channel: OutputChannel

  constructor() {
    this.channel = window.createOutputChannel('llamautoma')
  }

  debug(message: string, ...args: any[]) {
    this.log('DEBUG', message, ...args)
  }

  info(message: string, ...args: any[]) {
    this.log('INFO', message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.log('WARN', message, ...args)
  }

  error(message: string, ...args: any[]) {
    this.log('ERROR', message, ...args)
  }

  private log(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString()
    const formattedArgs = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    )
    const logMessage = `[${timestamp}] [${level}] ${message} ${formattedArgs.join(' ')}`
    this.channel.appendLine(logMessage)
  }

  dispose() {
    this.channel.dispose()
  }
}

export const logger = new Logger()
