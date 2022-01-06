#!/bin/sh

set -eo



# Clean up any old files
[ -d "./public" ] && rm -r ./public
mkdir -p ./public

# Build the frontend
echo "Building Frontend..."
cd ./src/frontend
npm ci
npm run build

# Build backend
echo "Building Backend..."
cd ../../
npx tsc
cp ./src/chat/layout.html ./public/chat/
cp ./src/notifications/layout.html ./public/notifications/

echo "Cleaning up..."
rm -rf ./src/frontend/node_modules

echo "Built and ready to go!"
