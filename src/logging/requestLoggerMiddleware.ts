import * as express from 'express';
import * as http from 'http';
import onFinished from 'on-finished';
import Logger from './Logger';

/**
 * Create a middleware that logs all requests.
 *
 * @param log - Logger to log to.
 * @param [options] - Options.
 * @param [options.excludeUrls] - An array of endpoints which should not be
 *   logged.  e.g. `['/status']` will make it so the /status endpoint is
 *   not logged.  Endpoints will only be skipped if they return a 2xx response.
 * @returns - Middleware function which logs all HTTP traffic to the log.
 */
export default function makeRequestLoggerMiddleware(
    log: Logger,
    options: { excludeUrls?: string[] } = {}
): express.RequestHandler {
    const excludeUrls = options.excludeUrls || [];

    return function requestLoggerMiddleware(
        req: http.IncomingMessage,
        res: http.ServerResponse,
        next: (err?: Error) => void
    ) {
        const start = Date.now();
        onFinished(res, function () {
            try {
                const url = (req as any).originalUrl || req.url;

                if (excludeUrls.includes(url) && res.statusCode >= 200 && res.statusCode <= 299) {
                    // Skip this endpoint.
                    return;
                }

                if (req.method === 'OPTIONS') {
                    // Don't bother logging OPTIONS requests.
                    return;
                }

                if (!('responseTime' in res)) {
                    (res as any).responseTime = Date.now() - start;
                }

                log.info({
                    request: req,
                    response: res,
                    tags: ['http'],
                });
            } catch (err) {
                log.error({ err }, 'Error logging request');
            }
        });

        return next();
    };
}
