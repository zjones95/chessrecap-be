FROM node:17-alpine as build-image
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY ./src ./src
RUN npm ci
RUN npx tsc

FROM node:17-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=build-image ./usr/src/app/dist ./dist
RUN npm ci --production
COPY . .

# Generate Prisma Client
COPY prisma .
RUN npx prisma generate

EXPOSE 5000

CMD [ "node", "dist/index.js" ]