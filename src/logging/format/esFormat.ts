import * as http from 'http';
import _ from 'lodash';
import os from 'os';
import { SanitizedLogInfo } from '../LogInfo';

const HOSTNAME = os.hostname();

interface EsInfo {
    '@timestamp': string;
    message: string;
    pid: number;
    host: string;
    tags?: string[];
    err?: string;
    level?: string;
    name?: string;
    request?: {
        method: string;
        url: string;
        normalizedUrl: string;
        remoteAddress: string;
    };
    response?: {
        statusCode: number;
        responseTime: number;
        fullHeaders: string;
    };
    src?: {
        file: string;
    };
}

/**
 * Format messages before sending them to elasticsearch.
 */
export class EsFormat {
    transform(info: SanitizedLogInfo): any {
        const result: EsInfo = {
            '@timestamp': info['@timestamp'] || new Date().toISOString(),
            host: HOSTNAME,
            message: info.message || '',
            pid: process.pid,
            tags: info.tags,
            err: info.err ? info.err.stack : undefined,
            level: info.level,
            name: info.name,
            src: info.src,
        };

        const { request, response } = info;
        if (request) {
            result.request = {
                method: request.method || '',
                url: (request as any).originalUrl || request.url,
                normalizedUrl: normalizeExpressPath(request),
                remoteAddress: (request as any).ip,
            };
        }
        if (response) {
            result.response = {
                statusCode: response.statusCode,
                responseTime: (response as any).responseTime, // Need to add this yourself,
                fullHeaders: JSON.stringify(
                    _.omit(response.getHeaders(), 'set-cookie', 'server-timing')
                ),
            };
        }

        return result;
    }
}

export default function (): EsFormat {
    return new EsFormat();
}

/**
 * Given an express request, returns the normalized URL of the request.
 *
 * The basic idea here is when someone visits
 * "/api/v2/User/5ddc3ed8643713eb372b993a", we want to collect metrics about
 * the endpoint "/api/v2/User/:id".  This works for Exegesis paths, too.
 *
 */
function normalizeExpressPath(req: http.IncomingMessage) {
    const expressReq = req as any;
    if ('route' in expressReq && expressReq.route.path !== undefined) {
        return (expressReq.baseUrl || '') + expressReq.route.path.toString();
    } else {
        return undefined;
    }
}
