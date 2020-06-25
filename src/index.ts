import express from 'express';
import log from './winston';
import makeRequestLoggerMiddleware from './requestLoggerMiddleware';

const PORT = 3000;

const app = express();

app.use(makeRequestLoggerMiddleware(log));
app.get('/', (_req, res) => res.send('Hello world!'));

app.listen(PORT, () => {
    log.info(`Listening on http://localhost:${PORT}`);
    if (!process.env.ELASTICSEARCH_URLS) {
        log.info(
            `To log to Elasitcsearch, set ELASTICSEARCH_URLS.\n` +
                `e.g. "http://elasticsearch:9200".`
        );
    }
});
