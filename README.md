# Klaim

Personal voucher & rewards portfolio aggregator for Indian shoppers. AI advisor recommends the right voucher for any shopping intent. Chrome extension surfaces vouchers at checkout on 20+ Indian retailers.

## Stack
- React 18 + Vite
- Tailwind CSS
- Lucide icons
- OpenAI gpt-4o for AI Advisor + Vision OCR
- Vercel serverless functions proxy API calls (key kept server-side)

## Environment variables
Set in Vercel project settings:
- `OPENAI_API_KEY` — get from platform.openai.com → API Keys

If `OPENAI_API_KEY` is not set, both endpoints fall back to demo mocks (smart canned responses + 4 fake voucher extractions). The deploy works either way.

## Local development
```
npm install
npm run dev
```

## Deploy
Push to GitHub. Vercel auto-deploys on every commit to main.

## Routes
- `/` — Dashboard
- `/api/advisor` — Proxies advisor queries to OpenAI gpt-4o
- `/api/ocr` — Proxies screenshot OCR via gpt-4o Vision
