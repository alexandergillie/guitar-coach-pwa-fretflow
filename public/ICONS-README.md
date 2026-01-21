# App Icons

## Quick Setup (Current)

Currently using a placeholder SVG icon. For production, you should generate proper PNG icons.

## Generate Icons from SVG

You can use online tools or command-line tools to generate PNG icons from `icon.svg`:

### Option 1: Using Online Tools
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload the `icon.svg` file
3. Download the generated icon pack
4. Place all PNG files in this `public/icons/` directory

### Option 2: Using ImageMagick (CLI)
```bash
# Install ImageMagick first: https://imagemagick.org/script/download.php
cd public/icons

# Generate all sizes
magick icon.svg -resize 72x72 icon-72x72.png
magick icon.svg -resize 96x96 icon-96x96.png
magick icon.svg -resize 128x128 icon-128x128.png
magick icon.svg -resize 144x144 icon-144x144.png
magick icon.svg -resize 152x152 icon-152x152.png
magick icon.svg -resize 192x192 icon-192x192.png
magick icon.svg -resize 384x384 icon-384x384.png
magick icon.svg -resize 512x512 icon-512x512.png
```

### Option 3: Using Node.js script
```bash
npm install -g sharp-cli
cd public/icons

# Generate all sizes
sharp -i icon.svg -o icon-72x72.png resize 72 72
sharp -i icon.svg -o icon-96x96.png resize 96 96
sharp -i icon.svg -o icon-128x128.png resize 128 128
sharp -i icon.svg -o icon-144x144.png resize 144 144
sharp -i icon.svg -o icon-152x152.png resize 152 152
sharp -i icon.svg -o icon-192x192.png resize 192 192
sharp -i icon.svg -o icon-384x384.png resize 384 384
sharp -i icon.svg -o icon-512x512.png resize 512 512
```

## Required Sizes for PWA

The manifest.json currently references these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 (minimum required for PWA)
- 384x384
- 512x512 (recommended for splash screens)

## Custom Icon Design

To create a custom icon:
1. Edit `icon.svg` with your preferred vector graphics editor
2. Regenerate PNG files using one of the methods above
3. Update manifest.json if you change the icon theme or colors
