FROM node:14-alpine

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install --only=production

COPY . .

RUN chmod +x ./wait-for.sh

#ENV NODE_ENV=development
#ENV DATABASE_URL=postgres://me:google12@postgres:5432/simple_bank

EXPOSE 8080

CMD ["npm", "start"]