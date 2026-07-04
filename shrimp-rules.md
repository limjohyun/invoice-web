# Development Standards for AI Agent

**This document defines project-specific rules for AI agents to execute tasks in the invoice-web project.**

---

## 1. Project Overview

**Project Name:** invoice-web (Notion-based Invoice Management System)

**Purpose:** Web application for managing invoices/quotes with Notion database integration

**Tech Stack:**

- Framework: Next.js 15.5.19 (App Router + Turbopack)
- Runtime: React 19.1.0 + TypeScript 5
- Styling: TailwindCSS v4
- UI Components: shadcn/ui (new-york style) + Radix UI
- Forms: React Hook Form + Zod validation
- Database: Notion API (planned integration)
- Development Tools: ESLint, Prettier, Husky, lint-staged

**Current Status:** Initial setup complete, authentication pages (login/signup) implemented

---

## 2. Project Architecture

### Directory Structure Rules

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── login/page.tsx     # Login page
│   ├── signup/page.tsx    # Signup page
│   ├── layout.tsx         # Root layout
│   └── [future-features]/ # New feature routes
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components (DO NOT modify Radix structure)
│   ├── layout/           # Layout components (header, footer, container)
│   ├── navigation/       # Navigation components
│   ├── sections/         # Page sections (hero, features, cta)
│   ├── providers/        # React context providers
│   ├── [feature-name]/   # Feature-specific components (new features)
│   ├── [form-name]-form.tsx  # Form components
│   └── theme-toggle.tsx  # Theme toggle
│
└── lib/                   # Utilities & config
    ├── schemas/          # Zod validation schemas
    ├── env.ts           # Environment variables
    └── utils.ts         # Helper functions
```

### Key Rules for Directory Structure

- **Page Routes:** Only use `src/app/` for page routes. Each route feature must have its own directory.
- **Feature Components:** When adding new features, create a feature-specific subdirectory under `src/components/` (e.g., `src/components/invoices/` for invoice management)
- **Shared Components:** Place reusable components in `src/components/` root or create semantic categories
- **API Routes (Future):** Create `src/app/api/` directory when implementing Server Actions or API endpoints
- **Notion Integration (Future):** Create `src/lib/notion/` for Notion API utilities and data models

---

## 3. Code Standards

### Naming Conventions

- **Variables & Functions:** `camelCase`
- **React Components:** `PascalCase`
- **File Names:** `kebab-case` for regular files, `PascalCase` for React components
- **Directories:** `kebab-case`

### Comment & Documentation Rules

- **JSDoc Comments:** Add brief JSDoc for functions (max 1-2 lines)
  ```typescript
  /** Validates invoice data against schema */
  const validateInvoice = (data: unknown) => {
    // ...
  }
  ```
- **Inline Comments:** Only add if logic is non-obvious or contains workaround
- **Korean:** All code comments, commit messages, and documentation must be in Korean
- **Prohibited:** Explanatory docstrings, multi-paragraph comments

### Code Quality Rules

- **Type Safety:** Always use TypeScript strict mode, no `any` types unless absolutely necessary
- **Imports:** Use path aliases (`@/`) from `tsconfig.json`
- **Unused Code:** Delete completely, do not leave `// removed` comments
- **Import Organization:**

  ```typescript
  // 1. React & Next.js
  import { useEffect } from 'react'
  import { useRouter } from 'next/navigation'

  // 2. External libraries
  import { useForm } from 'react-hook-form'

  // 3. Internal components & utils
  import { Button } from '@/components/ui/button'
  import { invoiceSchema } from '@/lib/schemas/invoice'
  ```

---

## 4. Component Implementation Standards

### shadcn/ui Component Usage

- **Required:** Use shadcn/ui components as base for all UI elements
- **Installation:** Use `npx shadcn@latest add [component-name]` command
- **Customization:** Modify Tailwind classes in component files, do not create wrapper components
- **Prohibited:** Do not bypass Radix UI structure, do not create custom button/input alternatives

### Component Patterns

**Presentational Component:**

```typescript
// src/components/invoice-card.tsx
import { Card } from '@/components/ui/card'

interface InvoiceCardProps {
  invoiceId: string
  title: string
  amount: number
}

export function InvoiceCard({ invoiceId, title, amount }: InvoiceCardProps) {
  return (
    <Card className="p-4">
      <h3>{title}</h3>
      <p>{amount}</p>
    </Card>
  )
}
```

**Server Component (Next.js 15):**

```typescript
// src/app/invoices/page.tsx - Server Component by default
export default async function InvoicesPage() {
  // Fetch data on server
  const invoices = await fetchInvoices()

  return (
    <div>
      {invoices.map(invoice => (
        <InvoiceCard key={invoice.id} {...invoice} />
      ))}
    </div>
  )
}
```

**Client Component:**

```typescript
'use client'

import { useState } from 'react'

export function InvoiceFilter() {
  const [filter, setFilter] = useState('')

  return <input onChange={(e) => setFilter(e.target.value)} />
}
```

### Component Naming Rules

- **Format:** `[Feature][Component].tsx` or `[feature]-[component].tsx`
- **Examples:** `InvoiceList.tsx`, `invoice-detail.tsx`, `LoginForm.tsx`
- **Props Interface:** Name as `[ComponentName]Props`

---

## 5. Form Handling Standards

### Required Approach: React Hook Form + Zod

**Schema Definition (src/lib/schemas/):**

```typescript
// src/lib/schemas/invoice.ts
import { z } from 'zod'

export const invoiceSchema = z.object({
  title: z.string().min(1, '견적서 제목을 입력하세요'),
  amount: z.number().positive('금액은 0보다 커야 합니다'),
  clientName: z.string().min(1, '고객명을 입력하세요'),
  dueDate: z.date().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
```

**Form Component:**

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { invoiceSchema, type InvoiceFormData } from '@/lib/schemas/invoice'

export function InvoiceForm() {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  })

  const onSubmit = async (data: InvoiceFormData) => {
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Rules

- **Always use Zod schemas:** Define all form validation in `src/lib/schemas/`
- **Server Actions (Future):** Use for form submission when backend is ready
- **Error Messages:** Must be in Korean
- **Prohibited:** Do not use inline validation, do not create custom validators

---

## 6. Styling Standards

### TailwindCSS v4 Rules

- **Preferred:** Use TailwindCSS utility classes (no custom CSS)
- **File Organization:** Write Tailwind in component files, no separate CSS files (except globals.css)
- **Dark Mode:** Use `dark:` prefix for dark mode variants
- **Responsive:** Use `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Theme:** Use colors from `tailwind.config.ts`

### Example

```typescript
export function InvoiceCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Invoice Title
      </h3>
    </div>
  )
}
```

---

## 7. Notion API Integration Standards

### Data Model Pattern

When implementing Notion integration, follow this structure:

**Define Schema (src/lib/schemas/):**

```typescript
// src/lib/schemas/invoice.ts
export const invoiceSchema = z.object({
  id: z.string(),
  notionPageId: z.string(), // Notion database record ID
  title: z.string(),
  amount: z.number(),
  clientName: z.string(),
  status: z.enum(['draft', 'sent', 'paid']),
  createdAt: z.date(),
  updatedAt: z.date(),
})
```

**Notion Utilities (src/lib/notion/):**

```typescript
// src/lib/notion/client.ts
import { Client } from '@notionhq/client'

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
})

export const databaseId = process.env.NOTION_INVOICE_DATABASE_ID

// src/lib/notion/invoices.ts
export async function fetchInvoices() {
  const response = await notionClient.databases.query({
    database_id: databaseId,
  })
  // Parse and return typed data
}

export async function createInvoice(data: InvoiceFormData) {
  // Create Notion page with data
}
```

### Rules for Notion Integration

- **Environment Variables:** Store `NOTION_API_KEY` and database IDs in `.env.local`
- **Database IDs:** Create constants in `src/lib/notion/client.ts`
- **Data Transformation:** Create helper functions to convert Notion API responses to TypeScript types
- **Error Handling:** Catch Notion API errors and provide user-friendly messages
- **Prohibited:** Do not hardcode database IDs, do not fetch without error boundaries

---

## 8. Key File Interactions

### Files That Require Simultaneous Updates

| Situation                      | Files to Update                                                         | Reason                             |
| ------------------------------ | ----------------------------------------------------------------------- | ---------------------------------- |
| Add new npm package            | `package.json`, `package-lock.json`                                     | Keep dependencies in sync          |
| Add new environment variable   | `.env.example`, `.env.local`                                            | Document required env vars         |
| Modify project standards       | `shrimp-rules.md`, `CLAUDE.md`                                          | Update AI and developer guidelines |
| Add new Notion database        | `.env.local`, `src/lib/notion/client.ts`                                | Configure API access               |
| Create new feature with routes | `src/app/[feature]/page.tsx`, `src/components/[feature]/`               | Feature-specific structure         |
| Update UI component styles     | Component file Tailwind classes, `tailwind.config.ts` (if theme change) | Maintain design consistency        |

---

## 9. AI Decision-Making Guide

### When to Create New Files/Directories

- **New Page Route:** Create in `src/app/[feature]/page.tsx`
- **New Reusable Component:** Create in `src/components/` or feature subdirectory
- **New Utility Function:** Add to `src/lib/utils.ts` or create `src/lib/[feature]/`
- **New Schema:** Create in `src/lib/schemas/[feature].ts`
- **New Form:** Create as `[feature]-form.tsx` in `src/components/`

### When to Use Server Components vs Client Components

| Situation                         | Use              | Reason                                |
| --------------------------------- | ---------------- | ------------------------------------- |
| Display static content            | Server Component | Reduce JS bundle, improve performance |
| Fetch data from Notion API        | Server Component | Secure API keys, faster data load     |
| User interaction (buttons, forms) | Client Component | Need React hooks and event handlers   |
| Layout/wrapper component          | Server Component | Composition, splitting code           |
| Modal, dropdown, state            | Client Component | Requires useState, useEffect          |

### Priority Rules for Feature Implementation

1. **Validation First:** Always define Zod schema before form component
2. **UI Components Second:** Use shadcn/ui, no custom implementations
3. **Notion Integration Last:** After UI/form logic is working
4. **Error Handling:** Wrap API calls in try-catch, show user-friendly messages
5. **Types First:** Define TypeScript interfaces before implementation

### Prohibited Decisions

- ❌ Do not use pages router (must use App Router)
- ❌ Do not create custom button/input components (use shadcn/ui)
- ❌ Do not hardcode API keys or database IDs
- ❌ Do not use `any` type without strong justification
- ❌ Do not modify Radix UI component structure
- ❌ Do not create inline CSS or CSS modules (use Tailwind)
- ❌ Do not fetch data in client components if Notion API is involved
- ❌ Do not include explanatory content in this document (rules only)

---

## 10. Development Workflow

### Required Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run typecheck    # Run TypeScript type check
npm run check-all    # Run all checks (recommended before commit)

# Build & Deployment
npm run build        # Production build
npm run start        # Start production server
```

### Git Commit Standards

- **Message Format:** Use conventional commits with emoji in Korean
- **Examples:**
  - `✨ feat: 견적서 조회 기능 추가`
  - `🐛 fix: 로그인 폼 유효성 검사 오류 수정`
  - `♻️ refactor: 컴포넌트 구조 개선`
  - `📝 docs: README 업데이트`

---

## 11. Testing Standards (Future Implementation)

When test infrastructure is added:

- Create tests in `src/__tests__/` or colocate with components
- Use testing library for component tests
- Use vitest or Jest for unit tests
- Aim for critical path coverage (forms, API integration, business logic)

---

## 12. Deployment & Environment Standards (Future Implementation)

When deployment is configured:

- Use environment variables for Notion API key and database IDs
- Separate `.env.local` (development) from `.env.production`
- Use `process.env` only in server components or API routes
- Never expose API keys in client-side code

---

**Last Updated:** 2026-07-04  
**Document Version:** 1.0
