import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo.png" alt="misremates" width={120} height={40} className="h-10 w-auto" />
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              La plataforma para vender tus productos en remate con tu propia tienda online.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Plataforma</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/pricing" className="hover:text-slate-900">Planes</Link></li>
              <li><Link href="/register" className="hover:text-slate-900">Crear tienda</Link></li>
              <li><Link href="/login" className="hover:text-slate-900">Iniciar sesión</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/terminos" className="hover:text-slate-900">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-slate-900">Aviso de Privacidad</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Contacto</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>soporte@misremates.com.mx</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} misremates.com.mx — Todos los derechos reservados
        </div>
      </div>
    </footer>
  )
}
