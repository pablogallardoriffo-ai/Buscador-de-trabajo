"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Botón que muestra un código QR con el enlace de la oferta,
 * para abrirla y postular desde el celular.
 */
export function QrButton({ url, title }: { url: string; title?: string | null }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && !dataUrl) {
      QRCode.toDataURL(url, { width: 320, margin: 1 })
        .then(setDataUrl)
        .catch(() => setDataUrl(null));
    }
  }, [open, url, dataUrl]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="Abrir en el celular (QR)"
        onClick={() => setOpen(true)}
      >
        <QrCode size={16} />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-lg border border-border bg-card p-6 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Escanea con tu celular</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="Código QR de la oferta"
                className="mx-auto h-56 w-56 rounded-md bg-white p-2"
              />
            ) : (
              <div className="mx-auto flex h-56 w-56 items-center justify-center text-sm text-muted-foreground">
                Generando…
              </div>
            )}
            {title && (
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                {title}
              </p>
            )}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Abrir la oferta aquí
            </a>
          </div>
        </div>
      )}
    </>
  );
}
