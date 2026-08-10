import { useEffect } from 'react';

// Lightweight per-page SEO: sets <title> + meta description + Open Graph tags.
// Not SSR, but modern crawlers render JS — this makes each public page carry
// its own title/description/social preview.
function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSEO({ title, description, canonical, image }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    if (image) setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
      link.setAttribute('href', canonical);
    }
    return () => { document.title = prevTitle; };
  }, [title, description, canonical, image]);
}
