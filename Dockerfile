FROM node:14.17.6-alpine3.14 as build
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci
COPY . /app/
RUN npm run build

FROM node:14.17.6-alpine3.14
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci --production
COPY config /app/config/
COPY --from=build /app/lib/ /app/lib/
USER node
EXPOSE 8080
EXPOSE 5000
EXPOSE 5001
CMD ["node", "lib/server.js"]