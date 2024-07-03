FROM debian:bullseye-slim

RUN apt-get -y update
RUN apt-get update && apt-get install -y apt-transport-https
RUN apt-get update && apt-get install -y curl

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs

RUN apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

RUN npm install
RUN npx prisma generate
CMD ["node", "telegram.js"]

EXPOSE 8080