# misremates.com.mx — Estado del proyecto

**Dominio:** misremates.com.mx  
**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Stripe  
**Ubicación:** `S:/dev-agency/projects/misremates`

---

## Progreso General

| Módulo | Estado | Notas |
|--------|--------|-------|
| Landing page | ✅ Listo | Hero, features, how it works, pricing teaser, CTA |
| Auth (login/register) | ✅ Listo | Supabase Auth con SSR, validación Zod |
| Middleware de rutas | ✅ Listo | Protege /dashboard y /admin |
| Dashboard principal | ✅ Listo | Stats, plan limits, enlace a tienda |
| Gestión de tienda | ✅ Listo | Crear/editar nombre, descripción, WhatsApp |
| CRUD de productos | ✅ Listo | Crear con fotos, validación de límites por plan |
| Lista de productos | ✅ Listo | Dashboard con estado, precio, acciones |
| Página pública de tienda | ✅ Listo | `/s/[slug]` con grid de productos |
| Página pública de producto | ✅ Listo | `/s/[slug]/p/[slug]` con botón WhatsApp |
| Página de precios | ✅ Listo | 4 planes con tabla de features |
| Billing (suscripciones) | ✅ Listo | Checkout Stripe, visualización de plan actual |
| Stripe Connect | ✅ Listo | Onboarding Express, verificación de estado |
| Webhooks Stripe | ✅ Listo | subscription, payment, account.updated |
| Panel Admin | ✅ Listo | Usuarios, productos, suscripciones (role admin) |
| UI Components | ✅ Listo | Button, Input, Card, Badge, Dialog, Select, etc. |
| Base de datos SQL | ✅ Listo | Schema completo + RLS + Storage bucket |
| Validación de límites | ✅ Listo | Por plan: productos, valor inventario |
| Upgrade modal | ✅ Listo | Aparece al alcanzar límite |

---

## ❌ Pendiente / Por hacer

### Configuración inicial (REQUERIDO antes de probar)
- [ ] Crear proyecto en [supabase.com](https://supabase.com) y obtener URL + keys
- [ ] Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase
- [ ] Crear cuenta en [stripe.com](https://stripe.com) y obtener keys
- [ ] Crear los 3 productos de suscripción en Stripe Dashboard (`basico`, `pro`, `premium`)
- [ ] Copiar los `price_id` de Stripe al `.env.local` y al seed SQL
- [ ] Llenar el archivo `.env.local` con todas las variables
- [ ] Configurar webhook en Stripe → `https://tu-dominio.com/api/stripe/webhook`

### Funcionalidades pendientes
- [ ] Editar producto existente (`/dashboard/products/[id]/edit`)
- [ ] Eliminar producto con confirmación
- [ ] Subida de logo/banner de tienda a Supabase Storage
- [ ] Checkout con Stripe para compras de productos (página `/checkout/[productId]`)
- [ ] Página pública de tienda — filtros por categoría
- [ ] Mobile sidebar (hamburger en dashboard)
- [ ] Callback de retorno desde Stripe Connect (`connected=true`)
- [ ] Analytics dashboard (Premium)
- [ ] Productos destacados en la landing/homepage
- [ ] SEO metatags con og:image
- [ ] Rate limiting en APIs
- [ ] Tests básicos

### Deploy
- [ ] Deploy en Vercel (conectar repo → dominio misremates.com.mx)
- [ ] Configurar dominio en Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Stripe webhook apuntando al dominio en producción
- [ ] Modo Live de Stripe (actualmente en Test)

---

## Estructura de archivos

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── admin/page.tsx
│   ├── auth/callback/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   └── billing-button.tsx
│   │   ├── connect/
│   │   │   ├── page.tsx
│   │   │   └── connect-button.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── store/page.tsx
│   ├── api/
│   │   ├── products/
│   │   │   ├── check-limits/route.ts
│   │   │   ├── create/route.ts
│   │   │   ├── update/route.ts
│   │   │   └── delete/route.ts
│   │   └── stripe/
│   │       ├── create-checkout-subscription/route.ts
│   │       ├── create-connect-account/route.ts
│   │       ├── create-account-link/route.ts
│   │       ├── create-product-payment/route.ts
│   │       └── webhook/route.ts
│   ├── pricing/page.tsx
│   ├── s/[storeSlug]/
│   │   ├── page.tsx
│   │   └── p/[productSlug]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── dashboard-sidebar.tsx
│   │   └── dashboard-topbar.tsx
│   ├── shared/
│   │   ├── product-card.tsx
│   │   ├── plan-limit-bar.tsx
│   │   └── upgrade-modal.tsx
│   └── ui/
│       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│       ├── dialog.tsx, dropdown-menu.tsx, input.tsx
│       ├── label.tsx, progress.tsx, select.tsx
│       ├── separator.tsx, tabs.tsx, textarea.tsx
│       └── ...
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── stripe.ts
│   ├── plans.ts
│   └── utils.ts
├── types/index.ts
└── middleware.ts

supabase/
├── schema.sql   ← Ejecutar en Supabase SQL Editor
└── seed.sql
```

---

## Modelo de negocio implementado

| Plan | Precio | Productos | Valor max | Comisión | Pagos online |
|------|--------|-----------|-----------|----------|--------------|
| Gratis | $0 | 3 | Sin límite | N/A | ❌ |
| Básico | $99/mes | 10 | $1,000 MXN | 8% | ❌ |
| Pro | $299/mes | 30 | $30,000 MXN | 5% | ✅ |
| Premium | $699/mes | ∞ | Sin límite | 2.5% | ✅ |

---

## Setup rápido

```bash
# 1. Instalar dependencias (ya instaladas)
cd S:/dev-agency/projects/misremates
npm install

# 2. Copiar y llenar variables de entorno
cp .env.local .env.local.example  # guarda el template
# edita .env.local con tus keys reales

# 3. Ejecutar schema en Supabase SQL Editor
# Copiar contenido de supabase/schema.sql

# 4. Levantar servidor de desarrollo
npm run dev
# → http://localhost:3000
```

---

*Última actualización: 2026-05-05*
