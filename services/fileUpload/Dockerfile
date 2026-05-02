# use official Node image
FROM node:20

# set working directory
WORKDIR /app

# copy package files first (for caching)
COPY package*.json ./

# install dependencies
RUN npm install

# copy rest of the code
COPY . .

# create uploads directory
RUN mkdir -p /app/src/uploads

# expose port
EXPOSE 3000

# run the app
CMD ["npm", "run", "dev"]