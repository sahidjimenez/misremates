'use client'

import { Share2, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface ShareStoreButtonProps {
  storeName: string
  storeSlug: string
}

export function ShareStoreButton({ storeName, storeSlug }: ShareStoreButtonProps) {
  const [copied, setCopied] = useState(false)
  const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://misremates.com.mx'}/s/${storeSlug}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: `Mira los remates de ${storeName} en misremates.com.mx`,
          url,
        })
      } catch {
        // user cancelled — do nothing
      }
      return
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Enlace copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Copiado' : 'Compartir tienda'}
    </Button>
  )
}
