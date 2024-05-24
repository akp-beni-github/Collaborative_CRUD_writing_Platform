FROM node:20.13.1

WORKDIR /app

COPY package*.json ./

# install new dependencies if any
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "rootServer.js"]
