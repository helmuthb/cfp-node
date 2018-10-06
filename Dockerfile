FROM node:8

EXPOSE 3000

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN chown -R node: /usr/src/app

USER node

RUN npm install

CMD [ "/usr/local/bin/node", "/usr/src/app/src/index.js" ]
