import { default as winston, LEVELS } from './winston';
import { LogInfo, sanitizeLogInfo } from './LogInfo';

const DEFAULT_LEVEL: keyof typeof LEVELS = 'info';

export interface LoggerOptions {
    name?: string;
    tags?: string[];
    filename?: string;
    details?: any;
}

/**
 * Wrapper around the winston Logger.
 *
 * This class presents a type-safe interface into logger.
 */
export default class Logger {
    readonly name: string | undefined;
    readonly filename: string | undefined;
    readonly tags: string[];
    private _details: any;
    private _levelNumber: number;
    private _winston = winston; // This is here for unit testing.

    /**
     * Create a new Logger.
     *
     * @param [options] - Logger options.
     * @param [options.name] - The name of this logger.
     * @param [options.tags] - Array of one or more tags to add to this logger.
     *   This may be overridden by explicitly providing tags in a LogInfo object.
     * @param [options.filename] - Name of the file this logger was created from.
     * @param [options.details] - Details to include with every message logged by
     *   this logger.  May be overridden by explicitly providing details in a
     *   logInfo object.
     */
    constructor(options: LoggerOptions = {}) {
        this.name = options.name;
        this.tags = options.tags || [];
        this.filename = options.filename;
        this._details = options.details;
        this._levelNumber = LEVELS[DEFAULT_LEVEL];
    }

    debug(message: string): void;
    debug(info: LogInfo, message?: string): void;
    debug(info: LogInfo | string, message?: string): void {
        this.log('debug', info, message);
    }
    isDebugEnabled(): boolean {
        return this.isLevelEnabled('debug');
    }

    info(message: string): void;
    info(info: LogInfo, message?: string): void;
    info(info: LogInfo | string, message?: string): void {
        this.log('info', info, message);
    }
    isInfoEnabled(): boolean {
        return this.isLevelEnabled('info');
    }

    warn(message: string): void;
    warn(info: LogInfo, message?: string): void;
    warn(info: LogInfo | string, message?: string): void {
        this.log('warn', info, message);
    }
    isWarnEnabled(): boolean {
        return this.isLevelEnabled('warn');
    }

    warning(message: string): void;
    warning(info: LogInfo, message?: string): void;
    warning(info: LogInfo | string, message?: string): void {
        this.log('warn', info, message);
    }
    isWarningEnabled(): boolean {
        return this.isLevelEnabled('warn');
    }

    error(message: string): void;
    error(info: LogInfo, message?: string): void;
    error(info: LogInfo | string, message?: string): void {
        this.log('error', info, message);
    }
    isErrorEnabled(): boolean {
        return this.isLevelEnabled('error');
    }

    log(level: string, info: LogInfo | string, message?: string): void {
        if (!this.isLevelEnabled(level)) {
            // Drop this message
            return;
        }

        if (typeof info === 'string') {
            message = info;
            info = {};
        }

        if (!info.details && this._details) {
            info.details = this._details;
        }

        // If there's an error, and no message, set the message.
        if (!message && info.err) {
            message = info.err.toString && info.err.toString();
        }

        const entry = sanitizeLogInfo(
            this.name,
            this.filename,
            level,
            message || '',
            info,
            this.tags
        );

        this._winston.log(entry);
    }

    /**
     * Check if this logger will log anything at the given level.
     * @param level - Level name.
     * @returns true if the Logger is enabled for the specified level, false
     *   if the Logger will drop messages at the specified level.
     */
    isLevelEnabled(level: string): boolean {
        const levelNumber = LEVELS[level];
        if (levelNumber === undefined) {
            return false;
        }
        return levelNumber <= this._levelNumber;
    }
}
