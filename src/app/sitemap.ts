import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'https://misremates.com.mx').replace(/\/$/, '')
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const supabase = await createClient()

  const { data: stores } = await supabase
    .from('stores')
    .select('slug, updated_at')
    .eq('status', 'active')

  const storeRoutes: MetadataRoute.Sitemap = (stores ?? []).map((s) => ({
    url: `${base}/s/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at, stores!inner(slug, status)')
    .eq('status', 'active')
    .eq('stores.status', 'active')

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => {
    const storeSlug = (p.stores as unknown as { slug: string }).slug
    return {
      url: `${base}/s/${storeSlug}/p/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly',
      priority: 0.6,
    }
  })

  return [...staticRoutes, ...storeRoutes, ...productRoutes]
}
