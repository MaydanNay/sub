# SHU Studio Landing Page Deployment & DevOps Guide

## Architecture Overview
The SHU Landing Page project consists of two local services running concurrently:
1. **Frontend**: React application built with Vite (`frontend/`).
2. **Bot Server**: A lightweight Node.js/Express server (`bot/`) that listens for Telegram messages and acts as an API proxy for the frontend contact form.

The main reason for the separation is security: the frontend cannot hold the Telegram Bot Token safely, as it would be exposed in the browser.

## Environment Variables

### Bot Server (`SHU/bot/.env`)
The bot server requires the following environment variables. Ensure this file is never committed to version control.
```env
TELEGRAM_BOT_TOKEN="your_bot_token_here"
ADMIN_PASSWORD="Aa12345"
PORT=3001
```

## Running the Application Locally

A convenient startup script is provided at the root of the `SHU` directory:
```bash
cd SHU
chmod +x start.sh
./start.sh
```
This script will:
1. Install dependencies for the Bot server and start it on port `3001`.
2. Install dependencies for the Frontend and start Vite on port `5175`.
3. Terminate both background processes gracefully upon pressing `CTRL+C`.

*Note: If port `3001` or `5175` is already in use by another orphan node process, you may need to kill it (`kill -9 $(lsof -t -i:3001)`).*

## Telegram Bot Setup (Admin Registration)
Before the website form can successfully send notifications, someone must register as the "admin" via the Telegram bot:
1. Open the connected Telegram bot.
2. Send the `/start` command.
3. The bot will ask for a password. Reply with the value defined in `ADMIN_PASSWORD` (default: `Aa12345`).
4. The bot will save the Chat ID locally in `SHU/bot/admin.json`. Subsequent form submissions from the website will be routed to this Chat ID.

## ⚠️ Critical Performance Issue (To-Do for DevOps/Designers)
**The application structure is fully optimized, but the image assets are significantly oversized.**
The total weight of the landing page exceeds **50 MB**, which will lead to catastrophic loading times (20–60 seconds) on 3G/4G mobile networks and heavy CPU throttling, especially during Framer Motion animations.

**Immediate actions required for production:**
1. Convert `frontend/src/image/girl.gif` (13.2 MB) to `WebM` or compressed `MP4`.
2. Convert massive vector files to raster WebP:
   - `offece.svg` (10.3 MB) -> WebP
   - `makeup.svg` (10.2 MB) -> WebP
   - `safety.svg` (9.2 MB) -> WebP
   - `ufo.svg` (5.3 MB) -> WebP
   - `sticker_1.svg`, `sticker_2.svg`, `crown.svg` -> WebP
3. Minify any remaining SVGs under 500KB using SVGO.

Failure to compress these assets will severely impact user retention and SEO performance.
