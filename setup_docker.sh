#!/bin/bash

# CodeViz Docker Runner Setup Script
# This script builds the codeviz-runner:latest image required for visualization.

echo "🚀 Starting Docker Runner Build..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker daemon is not running or accessible."
    echo "Please ensure Docker Desktop is running and you have granted CLI access permissions."
    exit 1
fi

# Build the image
echo "📦 Building 'codeviz-runner:latest'..."
docker build -t codeviz-runner:latest -f backend/runners/Dockerfile.runner .

if [ $? -eq 0 ]; then
    echo "✅ Build Successful!"
    echo "You can now go back to the browser and run code to see visualizations."
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
