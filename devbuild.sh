#!/bin/sh

set -eo

# Clean up any old files
[ -d "./public" ] && rm -r ./public
mkdir -p ./public

# Build the frontend
echo "Building Frontend..."
cd ./src/frontend
npm run build

# Copy built files into output directory
mv -f ./build/* ../../public

# Build backend
echo "Building Backend..."
cd ../../
npx tsc
cp ./src/chat/layout.html ./public/chat/
cp ./src/notifications/layout.html ./public/notifications/

echo "Built and ready to go!"
