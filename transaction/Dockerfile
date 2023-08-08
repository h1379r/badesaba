FROM node:18.16.0-alpine
USER root
WORKDIR	/app
COPY ./package*.json ./
RUN npm i
COPY . .
RUN npm run build
CMD npm run start:prod