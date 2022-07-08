FROM node:latest


WORKDIR /usr/projects/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["nodemon","src/app.js"]