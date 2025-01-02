# Use an official Node.js runtime as the base image
FROM node:19

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all source files to the working directory
COPY . .

# ENV
ENV REACT_APP_API_URL='http://35.78.245.230:8080'

# Build the Next.js application
RUN npm run build


# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your app
CMD [ "npm", "run", "start" ]