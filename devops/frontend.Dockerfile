FROM node:18-alpine
# Node.js frontend with Vite
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5172
CMD ["npm", "run", "dev"]
