FROM node:lts-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install --ignore-engines

COPY . .

RUN yarn build

EXPOSE 3000
EXPOSE 3001

ENV SERVER_PORT=3000
ENV API_PORT=3001
ENV NODE_ENV=production

CMD ["yarn", "start"]
