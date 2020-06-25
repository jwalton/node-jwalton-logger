import winston from 'winston';
import { LogData, ElasticsearchTransport } from 'winston-elasticsearch';
import debugFormat from 'winston-format-debug';
import elasticsearchTemplate from './elasticsearchTemplate';
import esFormat from './format/esFormat';
import requestFormat from './format/requestFormat';
import prefixFormat from './format/prefixFormat';

export const LEVELS: { [key: string]: number } = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const COLORS: { [key: string]: string | string[] } = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'cyan',
};

winston.addColors(COLORS);

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                requestFormat({ debug: true, colors: true }),
                prefixFormat(),
                winston.format.colorize({ message: true }),
                debugFormat({
                    levels: LEVELS,
                    colors: COLORS,
                    colorizeMessage: false, // Already colored by `winston.format.colorize`.
                })
            ),
        }),
    ],
});

// Set ELASTICSEARCH_URLS to a list of URLs to connect to, e.g. "http://elasticsearch:9200".
const { ELASTICSEARCH_URLS } = process.env;

if (ELASTICSEARCH_URLS) {
    const nodes = ELASTICSEARCH_URLS.split(',');

    // winston-elasticsearch automatically moves a bunch of the log data into
    // a field called "meta".  This undoes this and moves it all back...
    function esTransformer({ message, level, timestamp, meta }: LogData) {
        return { message, level, timestamp, ...meta };
    }

    const esTransport = new ElasticsearchTransport({
        transformer: esTransformer,
        clientOpts: { nodes } as any,
        indexPrefix: 'log',
        mappingTemplate: elasticsearchTemplate,
        ensureMappingTemplate: true,
        format: winston.format.combine(requestFormat({ debug: false }), esFormat()),
    });

    logger.add(esTransport);
}

export default logger;
