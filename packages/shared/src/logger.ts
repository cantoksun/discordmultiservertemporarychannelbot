export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

export class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    private log(level: LogLevel, message: string, meta?: any) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        console.log(`[${timestamp}] [${level}] [${this.context}] ${message}${metaStr}`);
    }

    debug(message: string, meta?: any) {
        this.log(LogLevel.DEBUG, message, meta);
    }

    info(message: string, meta?: any) {
        this.log(LogLevel.INFO, message, meta);
    }

    warn(message: string, meta?: any) {
        this.log(LogLevel.WARN, message, meta);
    }

    error(message: string, meta?: any) {
        this.log(LogLevel.ERROR, message, meta);
    }
}
