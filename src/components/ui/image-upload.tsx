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
  maxDimension?: number;
  quality?: number;
}

function compressImage(
  file: File,
  maxKB: number = 400,
  maxDimension: number = 800,
  startQuality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No canvas context"));

        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let quality = startQuality;
        let result = canvas.toDataURL("image/jpeg", quality);

        while (result.length > maxKB * 1024 * 1.37 && quality > 0.3) {
          quality -= 0.05;
          result = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(result);
      };
      img.onerror = () => reject(new Error("Error loading image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsDataURL(file);
  });
}

function getBase64SizeKB(base64: string): number {
  const raw = base64.split(",")[1] || "";
  return Math.round((raw.length * 3) / 4 / 1024);
}

export function ImageUpload({
  value,
  onChange,
  className,
  aspect = "square",
  label,
  maxDimension = 800,
  quality = 0.82,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const compressed = await compressImage(file, 400, maxDimension, quality);
      onChange(compressed);
    } catch {
      alert("Error al procesar la imagen");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const sizeKB = value ? getBase64SizeKB(value) : 0;

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
            <p className="text-xs text-muted-foreground">Comprimiendo...</p>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
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
              <span className="text-[10px]">JPG, PNG</span>
            </p>
          </div>
        )}
      </div>
      {value && sizeKB > 0 && (
        <p className="text-[10px] text-muted-foreground">{sizeKB} KB</p>
      )}
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
  maxDimension?: number;
  quality?: number;
}

export function GalleryUpload({
  value,
  onChange,
  max = 10,
  maxDimension = 800,
  quality = 0.82,
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
      const compressed = await Promise.all(
        toProcess.map((file) => compressImage(file, 350, maxDimension, quality))
      );
      onChange([...value, ...compressed]);
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

  const totalSizeKB = value.reduce((acc, img) => acc + getBase64SizeKB(img), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((img, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border">
            <img src={img} alt={"Foto " + (i + 1)} className="h-full w-full object-cover" />
            <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
              {getBase64SizeKB(img)} KB
            </div>
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
        {value.length}/{max} fotos
        {totalSizeKB > 0 && " \u00B7 ~" + totalSizeKB + " KB total"}
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
