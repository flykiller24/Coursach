FROM node:latest

WORKDIR /app

# install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install

# static and code files
COPY img ./img
COPY static ./static
COPY views ./views
COPY server.js .

CMD [ "node", "server.js" ]