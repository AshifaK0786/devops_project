FROM node:20

WORKDIR /app

COPY . .

RUN npm install
ENV HOST=0.0.0.0

CMD ["npm", "start"]
