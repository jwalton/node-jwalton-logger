import Logger, { LoggerOptions } from './Logger';

/**
 * Call this at the top of a file to create a logger:
 *
 * @example
 *   import { getLoggerFromFilename } from './logging';
 *   const log = getLoggerFromFilename(__filename, { tags: ['users'] });
 */
export function getLoggerFromFilename(filename: string, options?: LoggerOptions): Logger {
    return new Logger({
        ...(options || {}),
        filename,
    });
}
