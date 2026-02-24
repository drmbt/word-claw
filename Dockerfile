FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Expose typical port
EXPOSE 1010

# Allow setting ENV_FILE_PATH dynamically if needed, but defaults to the mars config
CMD [ "npm", "start" ]
