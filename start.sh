#!/bin/bash

echo "========================================"
echo "Starting El Hotel Backend Server"
echo "========================================"
echo ""
echo "Make sure MySQL is running first!"
echo ""
read -p "Press Enter to continue..."
echo ""
echo "Installing dependencies..."
dotnet restore
echo ""
echo "Starting server..."
echo ""
echo "Backend will be available at:"
echo "  - HTTPS: https://localhost:5001"
echo "  - HTTP:  http://localhost:5000"
echo "  - Swagger: https://localhost:5001/swagger"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
dotnet run

