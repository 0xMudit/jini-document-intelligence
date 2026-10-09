// Vercel serverless entry — the Jini Express app is exported and mounted by the
// platform instead of listening on a port (server/index.ts gates `app.listen`
// on VERCEL not being set).
export { default } from "../server/index";