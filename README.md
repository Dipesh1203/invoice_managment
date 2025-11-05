# Invoice Management (Next.js)

Live demo: https://invoice-managment-kohl.vercel.app/

A lightweight invoice management web app built with Next.js. This repository contains the frontend and a minimal API for uploading and processing invoice data (extraction + processing routes included under `app/api`). The app supports uploading spreadsheets, normalizing invoice data, and basic invoice CRUD flows.

## Key features

- Upload and extract data from invoice files (XLSX/CSV).
- Normalize and process invoice records for the app's store.
- Simple UI with pages for Customers, Invoices and Products.
- Redux Toolkit for state management and modular slices.
- Ready for deployment to Vercel (production-ready Next.js configuration).

## Tech stack

- Next.js 16 (App Router)
- React 19
- Redux Toolkit + React-Redux
- Tailwind CSS
- Mongoose (optional server-side persistence)
- Utilities: lodash, uuid, xlsx

## Repo structure (important files)

- `app/` – Next.js app directory (pages and API routes under `app/api`)
  - `app/api/extraction/route.ts` – invoice extraction endpoint
  - `app/api/processing/route.ts` – invoice processing endpoint
  - `app/components/` – UI components (SectionCard, UploadBtn, WrapperProvider)
  - `app/customers`, `app/invoices`, `app/products` – top-level pages
- `redux/` – store and slices
- `utils/` – helpers (`normalizeInvoice.ts`, `utils.ts`)
- `public/` – static assets

## Getting started (development)

Requirements: Node.js (v18+ recommended) and pnpm (or npm/yarn).

1. Install dependencies

```powershell
pnpm install
```

2. Run the dev server

```powershell
pnpm dev
# then open http://localhost:3000
```

3. Build for production

```powershell
pnpm build
pnpm start
```

Available scripts (from `package.json`)

- `dev` – start Next.js dev server
- `build` – produce production build
- `start` – run Next.js in production mode
- `lint` – run ESLint

## Environment variables

This project can be extended to use a database. Typical env vars you may need when enabling DB features:

- `MONGODB_URI` – MongoDB connection string (if using the Mongoose-backed API)
- `NEXT_PUBLIC_SOME_KEY` – any public keys used in the client

Create a `.env.local` in the project root and add values as needed. The app runs without these if you only use client-side state.

## Deployment

The app is configured to work well on Vercel. To deploy:

1. Push your repository to GitHub (or connect your Git provider to Vercel).
2. Create a new Vercel project and point it to the repo.
3. Add any required environment variables in the Vercel dashboard.
4. Deploy — Vercel will run `pnpm build` by default for Next.js apps.

Live deployment (provided): https://invoice-managment-kohl.vercel.app/

## Contributing

Contributions are welcome. A minimal process:

1. Fork the repo
2. Create a feature branch
3. Open a PR with a clear title and description

Please follow existing code style and lint rules.

## License

This project is provided under the MIT license.

---

If you'd like, I can also:

- add a short CONTRIBUTING.md
- add a development environment guide (Docker / npm vs pnpm notes)
- wire up a basic .env.example with recommended vars

Tell me which of those you'd like next.
