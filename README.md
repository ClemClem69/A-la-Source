# Mon marché futé

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-jjhanqck)

## Sitemap

On Netlify, `/sitemap.xml` is served dynamically by `netlify/functions/sitemap.mjs`, so published articles appear without a redeploy and drafts stay excluded. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for both the Netlify build and Functions runtime. The static sitemap generated during the build remains as a fallback on other hosts.
