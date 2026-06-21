"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  aspect?: "square" | "wide";
  label?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  className,
  aspect = "square",
  label,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 2MB");
      return;
    }

    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch {
      alert("Error al leer la imagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 transition-colors hover:bg-muted/50 cursor-pointer overflow-hidden",
          aspect === "square" ? "aspect-square" : "aspect-video",
          value ? "border-transparent" : "border-muted-foreground/25"
        )}
        onClick={() => !loading && inputRef.current?.click()}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Procesando...</p>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
            <Upload className="h-8 w-8" />
            <p className="text-xs text-center px-2">
              Click para subir imagen
              <br />
              <span className="text-[10px]">JPG, PNG, máx 2MB</span>
            </p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

interface GalleryUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
}

export function GalleryUpload({
  value,
  onChange,
  max = 10,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = max - value.length;
    const toProcess = files.slice(0, remaining);

    setLoading(true);
    try {
      const base64s = await Promise.all(
        toProcess.map(async (file) => {
          if (file.size > 2 * 1024 * 1024) return null;
          return fileToBase64(file);
        })
      );
      const valid = base64s.filter((b): b is string => b !== null);
      onChange([...value, ...valid]);
    } catch {
      alert("Error al procesar imágenes");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((img, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border">
            <img src={img} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-colors hover:bg-muted/40"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/60">Agregar</span>
              </>
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length}/{max} fotos · JPG, PNG, máx 2MB cada una
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
