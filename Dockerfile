FROM pandoc/core:3.0.1

RUN apk update && apk add --no-cache bash nodejs-current yarn git

RUN addgroup -S node && adduser -S node -G node

WORKDIR /home/node/icml

RUN chown -R node:node /home/node/icml

USER node

COPY --chown=node:node package.json ./package.json
COPY --chown=node:node yarn.lock ./yarn.lock

RUN yarn

COPY --chown=node:node . .

ENTRYPOINT ["sh", "./scripts/setupProdServer.sh"]

CMD ["node", "./server/startServer.js"]
