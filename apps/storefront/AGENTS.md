<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Development Server Rules

- NEVER run `pnpm dev` without explicit user request - the user is likely already running the development server
- Always check for existing dev servers before attempting to start new ones
- If a dev server restart is needed, ask the user to restart it manually or kill existing processes first
