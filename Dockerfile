FROM node:14.17.1 as dependencies

WORKDIR /faketerest-pager

EXPOSE 3003

COPY . .

RUN npm install

RUN npm run build

WORKDIR dist

COPY .env .

CMD node ./server.js