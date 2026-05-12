'use client'

import { useState } from 'react'
import {
  ShoppingBag, TrendingUp, DollarSign, Clock, ChevronDown, ChevronUp,
  Mail, User, Package, ExternalLink, Copy, Check, ReceiptText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

interface OrderProduct {
  title: string
  images: string[] | null
  slug: string
  stores: { slug: string; name: string } | null
}

interface Order {
  id: string
  buyer_name: string
  buyer_email: string
  amount: number
  platform_fee: number
  seller_amount: number
  stripe_payment_intent_id: string | null
  status: OrderStatus
  created_at: string
  products: OrderProduct | null
}

interface Stats {
  totalRevenue: number
  totalFees: number
  totalGross: number
  paidCount: number
  pendingCount: number
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
}

const STATUS_VARIANT: Record<OrderStatus, 'active' | 'secondary' | 'warning' | 'destructive'> = {
  paid: 'active',
  pending: 'warning',
  cancelled: 'secondary',
  refunded: 'destructive',
}

const FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'refunded', label: 'Reembolsadas' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copiado')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="ml-1 text-slate-400 hover:text-slate-700 transition-colors">
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const product = order.products
  const image = product?.images?.[0]
  const storeSlug = product?.stores?.slug
  const productUrl = storeSlug && product?.slug ? `/s/${storeSlug}/p/${product.slug}` : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Summary row */}
      <button
        className="w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-4">
          {/* Product image */}
          <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-slate-100">
            {image ? (
              <img src={image} alt={product?.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-6 w-6 text-slate-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">
              {product?.title ?? 'Producto eliminado'}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {order.buyer_name}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {order.buyer_email}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">{formatDate(order.created_at)}</p>
          </div>

          {/* Amount + status */}
          <div className="shrink-0 text-right">
            <p className="font-bold text-slate-900">{formatCurrency(order.seller_amount)}</p>
            <p className="text-xs text-slate-400">que recibes</p>
            <div className="mt-1">
              <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'}>
                {STATUS_LABEL[order.status] ?? order.status}
              </Badge>
            </div>
          </div>

          <div className="shrink-0 text-slate-400">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Detail panel */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Buyer info */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Comprador</p>
              <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-800 font-medium">{order.buyer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${order.buyer_email}`}
                    className="text-green-600 hover:underline truncate"
                  >
                    {order.buyer_email}
                  </a>
                  <CopyButton text={order.buyer_email} />
                </div>
              </div>
            </div>

            {/* Product info */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Producto</p>
              <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-800 font-medium truncate">
                    {product?.title ?? 'Producto eliminado'}
                  </span>
                </div>
                {productUrl && (
                  <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver producto
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Desglose del pago</p>
            <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100 text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500">Precio de venta</span>
                <span className="font-medium text-slate-900">{formatCurrency(order.amount)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-slate-500">Comisión plataforma</span>
                <span className="text-slate-500">− {formatCurrency(order.platform_fee)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-green-50 rounded-b-lg">
                <span className="font-semibold text-green-800">Tú recibes</span>
                <span className="font-bold text-green-700">{formatCurrency(order.seller_amount)}</span>
              </div>
            </div>
          </div>

          {/* Technical references */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Referencias</p>
            <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100 text-xs font-mono">
              <div className="flex items-center justify-between px-4 py-2.5 gap-2">
                <span className="text-slate-400 shrink-0">ID orden</span>
                <span className="text-slate-600 truncate">{order.id}</span>
                <CopyButton text={order.id} />
              </div>
              {order.stripe_payment_intent_id && (
                <div className="flex items-center justify-between px-4 py-2.5 gap-2">
                  <span className="text-slate-400 shrink-0">Stripe PI</span>
                  <span className="text-slate-600 truncate">{order.stripe_payment_intent_id}</span>
                  <CopyButton text={order.stripe_payment_intent_id} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function OrdersList({ orders, stats }: { orders: Order[]; stats: Stats }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis ventas</h1>
        <p className="text-sm text-slate-500">Historial de compras realizadas en tu tienda</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ventas pagadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">{stats.paidCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ingresos totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalGross)}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">precio de venta acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tú recibes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">después de comisiones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pendientes de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold text-slate-900">{stats.pendingCount}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">compradores en proceso</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const count = f.value === 'all'
            ? orders.length
            : orders.filter((o) => o.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${filter === f.value ? 'text-green-100' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-20">
          <ReceiptText className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-600">
            {filter === 'all' ? 'Sin ventas aún' : `Sin ventas ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}`}
          </p>
          <p className="text-sm text-slate-400">
            {filter === 'all'
              ? 'Cuando alguien compre un producto aparecerá aquí'
              : 'Prueba otro filtro'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
