# Demokratia Portugal

Plataforma de transparência política e participação cívica para Portugal.

## Stack

- **Next.js 16** (App Router) · **Cloudflare Pages/Workers/D1/KV** · **Clerk v7** · **Google Gemini** (Genkit)

## Arranque local

```bash
npm install
npm run dev        # http://localhost:9003
```

## Variáveis de ambiente necessárias

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Google AI (Gemini)
GOOGLE_GENAI_API_KEY=

# Alpha Vantage (cotações)
ALPHA_VANTAGE_API_KEY=

# Admin
NEXT_PUBLIC_ADMIN_UIDS=
NEXT_PUBLIC_ADMIN_EMAILS=
```

## Build e deploy

```bash
npm run build      # Next.js build
npm run typecheck  # tsc --noEmit
```

Deploy via Cloudflare Pages — configurar `wrangler.toml` com binding D1 e KV.

## Documentação

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para arquitectura detalhada.


Welcome to your new developer home! Your Firebase Studio project has been successfully migrated to Antigravity.

Antigravity is our next-generation, agent-first IDE designed for high-velocity, autonomous development. Because Antigravity runs locally on your machine, you now have access to powerful local workflows and fully integrated AI editing capabilities that go beyond a cloud-based web IDE.

## Getting Started
- **Run Locally**: Use the **Run and Debug** menu on the left sidebar to start your local development server.
  - Or in a terminal run `npm run dev` and visit `http://localhost:9002`.
- **Deploy**: You can deploy your changes to Firebase App Hosting by using the integrated terminal and standard Firebase CLI commands, just as you did in Firebase Studio.
- **Cleanup**: Cleanup unused artifacts with the @cleanup workflow.

Enjoy the next era of AI-driven development!

File any bugs at https://github.com/firebase/firebase-tools/issues

**Firebase Studio Export Date:** 2026-03-19


---

## Previous README.md contents:

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
