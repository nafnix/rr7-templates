# Welcome to React Router 7 & I18n!

A modern, production-ready template for building full-stack React applications with **Server-Side Rendering (SSR)** using React Router 7.

## Features

- 🚀 Single Page Application (SPA)
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎨 TailwindCSS v4 for styling
- 📖 [React Router docs](https://reactrouter.com/)
- 🗺️ I18n with Lingui - supports English and Chinese
- ⚙️ [Husky](https://github.com/typicode/husky) with [lint-staged](https://github.com/lint-staged/lint-staged)
- ✅ Vitest for testing

## Requirements

- Node.js 22.16.0+ (managed via [Volta](https://volta.sh))
- pnpm 10.32.0+

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t rr7-ssr-i18n .

# Run the container
docker run -p 3000:3000 rr7-ssr-i18n
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `pnpm run build`:

```plaintext
├── package.json
├── pnpm-lock.yaml
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code (index.js)
```

Start the production server:

```bash
pnpm run start
```

## Internationalization (I18n)

This project uses [Lingui](https://lingui.dev/) for internationalization, supporting English (`en`) and Chinese (`zh`).

### Extracting Translations

After adding or modifying translatable text in your code, extract the messages:

```bash
pnpm run i18n:extract
```

This will update the translation catalogs in `app/lib/i18n/locales/`.

### Supported Languages

- English (`en`)
- Chinese (`zh`)

Users can switch languages via the language switcher component, and the preference is stored in a cookie.

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing with Testing Library.

```bash
# Run tests in watch mode
pnpm run test

# Run tests with UI
pnpm run test:ui

# Run tests once
pnpm run test:run

# Run tests with coverage
pnpm run test:coverage
```

## Linting and Formatting

This project uses ESLint and Prettier for code quality.

```bash
# Run ESLint
pnpm run lint

# Format code with Prettier (runs automatically on commit via lint-staged)
```

Pre-commit hooks are configured via Husky to automatically lint and format staged files.

## Styling

This template comes with [Tailwind CSS v4](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
