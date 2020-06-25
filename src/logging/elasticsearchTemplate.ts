export default {
    index_patterns: 'log-*',
    settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        index: {
            refresh_interval: '5s',
        },
    },
    mappings: {
        _source: { enabled: true },
        properties: {
            '@timestamp': { type: 'date' },
            message: { type: 'text' },
            tags: { type: 'keyword' },
            err: { type: 'text' },
            level: { type: 'keyword' },
            name: { type: 'keyword' },
            'src.file': { type: 'keyword' },
            'request.method': { type: 'keyword' },
            'request.url': { type: 'keyword' },
            'request.normalizedUrl': { type: 'keyword' },
            'request.remoteAddress': { type: 'keyword' },
            'response.statusCode': { type: 'short' },
            'response.responseTime': { type: 'float' },
            'response.fullHeaders': { type: 'text' },
        },
    },
};
