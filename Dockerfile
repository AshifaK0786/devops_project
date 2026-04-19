FROM node:18

WORKDIR /app

COPY app/backend/package*.json ./
RUN npm install

COPY app/backend/. ./

EXPOSE 5000

CMD ["npm", "start"]