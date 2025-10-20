#!/bin/bash

# Favicon Generation Script for Café POS System
# This script generates all required favicon sizes from the SVG source

echo "🎨 Generating favicons for Café POS System..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed!"
    echo "📦 Install it with:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Navigate to public directory
cd "$(dirname "$0")/public" || exit

# Check if source SVG exists
if [ ! -f "favicon.svg" ]; then
    echo "❌ favicon.svg not found!"
    exit 1
fi

echo "📁 Working directory: $(pwd)"
echo ""

# Generate PNG files
echo "🖼️  Generating PNG files..."

echo "  → favicon-16x16.png"
convert -background none favicon.svg -resize 16x16 favicon-16x16.png

echo "  → favicon-32x32.png"
convert -background none favicon.svg -resize 32x32 favicon-32x32.png

echo "  → apple-touch-icon.png (180x180)"
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png

echo "  → favicon-192x192.png"
convert -background none favicon.svg -resize 192x192 favicon-192x192.png

echo "  → favicon-512x512.png"
convert -background none favicon.svg -resize 512x512 favicon-512x512.png

# Generate ICO file
echo ""
echo "🔷 Generating favicon.ico..."
convert favicon-32x32.png favicon-16x16.png favicon.ico

echo ""
echo "✅ All favicons generated successfully!"
echo ""
echo "📋 Generated files:"
echo "  ✓ favicon-16x16.png"
echo "  ✓ favicon-32x32.png"
echo "  ✓ favicon-192x192.png"
echo "  ✓ favicon-512x512.png"
echo "  ✓ apple-touch-icon.png"
echo "  ✓ favicon.ico"
echo ""
echo "🎉 Done! Your favicons are ready to use."
echo ""
echo "💡 Tip: Clear your browser cache to see the new favicon."
