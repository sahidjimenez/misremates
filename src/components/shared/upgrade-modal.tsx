'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  reason: string
}

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Zap className="h-6 w-6 text-orange-600" />
          </div>
          <DialogTitle className="text-center">Límite de plan alcanzado</DialogTitle>
          <DialogDescription className="text-center">{reason}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <p className="text-center text-sm text-slate-500">
            Mejora tu plan para seguir publicando productos y hacer crecer tu tienda.
          </p>

          <div className="flex flex-col gap-2">
            <Link href="/dashboard/billing" onClick={onClose}>
              <Button className="w-full gap-2">
                <Zap className="h-4 w-4" />
                Ver planes disponibles
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
