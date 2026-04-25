# ⚛️ Core Web (Frontend)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This is a modern web application frontend built with [Next.js](https://nextjs.org), designed to be highly scalable, performant, and maintainable.

## 🚀 Compatibility

This frontend project is fully compatible and designed to work seamlessly with the backend project [core-api](https://github.com/Jchnc/core-api).

## ✨ Features & Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router) & [React 19](https://react.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for static type safety
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) components built on top of [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for lightweight and scalable global state
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) combined with [Zod](https://zod.dev/) for schema validation
- **Data Fetching**: [Axios](https://axios-http.com/)
- **Code Quality**:
  - Strict linting with ESLint and Prettier
  - Git hooks configured with Husky and `lint-staged`
  - Conventional Commits enforced via Commitlint

## 🛠️ Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or your preferred package manager (yarn, pnpm, bun)

### Quick Start

1. **Install the project dependencies:**

   ```bash
   npm install
   ```

2. **Configure your environment variables:**

   Copy the provided example environment file to create your own `.env` file:

   ```bash
   cp .env.example .env
   ```

   _(Make sure to open your new `.env` file and verify any required configuration values, such as the `core-api` backend URL.)_

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **View the application:**

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the app running locally.

## 📁 Project Structure

This project follows a structured Next.js App Router architecture:

```text
src/
├── actions/      # Next.js Server Actions
├── app/          # App Router pages and layouts
├── components/   # Reusable UI components (shadcn, custom)
├── config/       # Application configuration and constants
├── hooks/        # Custom React hooks
├── lib/          # Utility functions and shared logic
├── store/        # Zustand state management stores
└── types/        # TypeScript type definitions and interfaces
```

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Runs the built app in production mode.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run format`: Formats code using Prettier.
- `npm run typecheck`: Checks for TypeScript errors.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
