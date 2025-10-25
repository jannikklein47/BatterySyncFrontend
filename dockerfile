FROM node:22-alpine

RUN apk update
RUN apk add --update nodejs npm

WORKDIR /app

RUN npm install -g @quasar/cli

RUN npm install -g express

COPY package*.json ./

RUN npm install

COPY . .

RUN quasar build

EXPOSE 443

CMD [ "npm", "run", "start" ]