FROM pandoc/core

RUN apk update && apk add --no-cache nodejs yarn git
RUN addgroup -S node && adduser -S node -G node

WORKDIR /home/node/icml

RUN chown -R node:node /home/node/icml

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn


COPY . .

RUN chmod +x ./scripts/wait-for-it.sh

USER node

ENTRYPOINT . scripts/startServer.sh
