# Fast Lane Media

Website and admin dashboard for Fast Lane Media, a photography and videography studio in Atok, Limpopo.

## Stack

- React and Vite
- Supabase (database, auth and file storage for the gallery)
- Cloudflare (hosting)

## Run locally

npm install
npm run build
npm run preview

The public Supabase address and anon key are in .env.production and are read at build time.

## Admin

/admin/login. Upload photos and videos, or paste a YouTube or Vimeo link, and publish or hide items.

## Enquiry form

Set ACCESS_KEY in src/pages/Home.jsx to a Web3Forms access key. Until then the form opens the visitor's email app.
