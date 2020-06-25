import colors from 'colors/safe';
import * as http from 'http';
import * as logform from 'logform';
import { format } from 'winston';

export interface RequestFormatOptions {
    // If true, then `info.request` and `info.response` will overwritten.  If
    // false, they'll be passed through and only `info.message` will be set.
    debug: boolean;
    useColors: boolean;
}

export function requestToString(
    req: http.IncomingMessage,
    res: http.ServerResponse | undefined,
    useColors?: boolean
): string {
    let status = '';

    // Get the statusCode
    const statusCode = res && res.statusCode;
    if (statusCode) {
        status = `${statusCode}`;
        if (useColors) {
            const statusColor =
                statusCode < 200 ? colors.grey : statusCode < 400 ? colors.green : colors.red;
            status = colors.bold(statusColor(status));
        }
    }

    // Get the response time - added byu requestLoggerMiddleware.
    let responseTime = '';
    if (res && 'responseTime' in res) {
        responseTime = `${(res as any).responseTime}ms`;
    }

    // Get the content length
    const resHeaders = res?.getHeaders();
    const contentLengthValue = resHeaders?.['content-length'];
    const contentLength = contentLengthValue !== undefined ? `- ${contentLengthValue} bytes` : '';

    const host = req.headers && req.headers.host;
    const url = host !== undefined ? `${host}${req.url}` : `${req.url}`;

    let fields = [req.method, url, status, responseTime, contentLength];
    fields = fields.filter((f) => !!f);
    return fields.join(' ');
}

/**
 * Takes an info with a `req` (and optionally a `res`) and merges them together
 * into a single `req` string.
 */
const requestFormat: logform.FormatWrap = format(
    (info: logform.TransformableInfo, options: RequestFormatOptions) => {
        if (info.request) {
            const { request, response } = info;

            if (options.debug) {
                info.request = undefined;
                info.response = undefined;
            }

            const reqString = requestToString(request, response, options.useColors);

            // If there's no message, then replace the message with the request
            if (!info.message) {
                info.message = reqString;
            } else if (options.debug) {
                info.request = reqString;
            }
        }

        return info;
    }
);

export default requestFormat;
