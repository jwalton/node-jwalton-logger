FROM node:12.16.1-alpine as base
RUN apk --no-cache add bash expect bind-tools tini
WORKDIR /package

FROM base as build
RUN apk --no-cache add curl git python2 make g++
# Add package.json and run `npm install` first, to generate a cached layer for faster local builds.
ADD package.json package-lock.json /package/
RUN npm install -g npm && \
    npm ci --ignore-scripts && \
    rm -rf ~/.npm ~/.cache
ADD . /package
RUN npm run build

FROM build as prune
RUN npm prune --production && \
    rm -rf src test

FROM base as release
COPY --from=prune /package /package

EXPOSE 3000
ENTRYPOINT [ "tini" ]
CMD [ "node", "./dist/index.js" ]
