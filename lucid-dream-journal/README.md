# Lucid Dream Journal

A Next.js 14 + TypeScript app for tracking lucid dreams. Ready for deployment to Vercel and MongoDB Atlas.

## Quickstart

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file and set your MongoDB connection string:
   ```bash
   cp .env.example .env
   # set MONGODB_URI in .env
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Deploy to Vercel and add `MONGODB_URI` as a Project Environment Variable.

## Features
- CRUD dream entries: date, quality, sleep duration, WBTB count, lucid toggle + lucidity level, notes, tags
- Overview: daily, weekly, monthly, and all-time totals and averages
- Light/Dark mode with theme toggle
- Tailwind CSS UI