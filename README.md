# Field Notes — code review exercise

This repository contains three small, intentionally imperfect applications for technical interviews:

- `apps/mobile`: Expo + React Native field catalog
- `apps/api`: Express + TypeScript order API
- `apps/web`: React + Vite inventory dashboard

The applications run, but the code is not production-ready. Candidates should review one or more projects, explain the risks they find, and improve the highest-value issues. The goal is not to spot formatting preferences; it is to reason about behavior, security, reliability, performance, accessibility, and maintainability.

## Quick start

```bash
npm install
npm run dev:api
npm run dev:web
npm run dev:mobile
```

Use separate terminals for each app. The web app expects the API at `http://localhost:4000`; it also falls back to sample data when the API is unavailable.

## Suggested interview formats

- **45 minutes:** review one app, rank findings, and implement one fix.
- **90 minutes:** review two apps and fix two or three related issues.
- **Take-home:** review all apps, add tests, and document trade-offs.

Ask candidates to submit a short `REVIEW.md` with findings ordered by severity. A strong submission explains impact and verification, not only the changed lines.

> Interviewers: `INTERVIEWER_GUIDE.md` contains spoilers. Do not share it in a candidate branch.

## Safety note

The committed `.env` files are intentional review fixtures. Every credential points to an invalid host or is marked fake and must never be replaced with a real secret. Some automated secret scanners may still flag them; that is useful interview evidence, not a production credential.
