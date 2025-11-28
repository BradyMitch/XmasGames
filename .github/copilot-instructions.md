# Copilot Instructions — Next.js (App Router) + Supabase

> Use these guardrails whenever you propose files, generate code, or refactor.

## Project Layout (assume these exist)
- `app/` — route segments, layouts, pages, and server actions
- `app/api/` — API routes (Route Handlers)
- `components/` — reusable client/server components
- `public/` — static assets
- `styles/` — global and module CSS
- `types/` — project types (`supabase`, etc.)
- `utils/` — utilities (e.g., Supabase clients, helpers)

---

## Global Style & Syntax Rules
- Default to **TypeScript** and **ES modules**.
- **Tabs** for indentation (2-space width), **LF** line endings.
- Max line width **100** chars.
- Always use **parentheses** in arrow functions and **semicolons**.
- Always use **trailing commas** where valid.
- **Use `type` (not `interface`)** for object shapes.
- **Use `import type`** for type-only imports.
- Prefer `Image` from `next/image` and `Link` from `next/link`.

---

## Routing & Props (Strongly Typed)
- **Pages** must use `PageProps` and destructure typed params/search params directly.
- **Layouts** must use `LayoutProps`.
These types are global in nextjs and dont need to be imported.

### Page example (server component)
```ts
// app/post/[id]/page.tsx
import { initializeServerComponent } from "@/utils/supabase/helpers";

export const metadata: Metadata = {
	title: "Post Details",
	description: "View details for a specific post.",
	alternates: { canonical: "/post/[id]" },
	openGraph: { url: "/post/[id]" },
};

export default async function Page({ params, searchParams }: PageProps<"/post/[id]">) {
	const { id } = await params;
	const { q } = await searchParams;

	const { supabase, jwt } = await initializeServerComponent();

	const { data: post } = await supabase
		.from("post")
		.select("*")
		.eq("id", id)
		.single();

	// ... render
	return <div>{post?.title}</div>;
}

---

### Metadata

- Always define `metadata` for pages and layouts.
- Include at least `title`, `description`, `alternates`, and `openGraph` with `url`.

Example:
```ts
export const metadata: Metadata = {
	title: "Page Title",
	description: "Page description.",
	alternates: { canonical: "/path/to/page" },
	openGraph: { url: "/path/to/page" },
};
```

---

### Supabase Integration

- For server components, use `initializePage` from `@/utils/supabase/page` to set up Supabase client with auth context.
- For other contexts (client components, API routes), use appropriate Supabase clients.
  - Client components should use `createBrowserClient` from `@/utils/supabase/clients/browser`.
	- Other server contexts should use `createServerClient` from `@/utils/supabase/clients/server`.
	- For admin tasks, use `createAdminClient` from `@/utils/supabase/clients/admin`.
