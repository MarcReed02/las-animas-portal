"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"];

const MAX_ITEMS = 8;

export type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type AnnouncementImageUploaderProps = {
  onChange?: (images: UploadedImage[]) => void;
};

export default function AnnouncementImageUploader({ onChange }: AnnouncementImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    onChange?.(images);
  }, [images, onChange]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const accepted: UploadedImage[] = [];
      let rejected = false;

      Array.from(fileList).forEach((file) => {
        if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
          rejected = true;
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        accepted.push({
          id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${file.name}`,
          file,
          previewUrl,
        });
      });

      if (rejected) {
        setError("Solo se permiten imagenes JPG o PNG.");
      } else {
        setError(null);
      }

      if (accepted.length === 0) return;

      setImages((prev) => {
        const combined = [...prev, ...accepted];
        if (combined.length > MAX_ITEMS) {
          combined.slice(0, combined.length - MAX_ITEMS).forEach((item) => URL.revokeObjectURL(item.previewUrl));
        }
        return combined.slice(-MAX_ITEMS);
      });
    },
    [],
  );

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const target = prev.find((img) => img.id === id);
        if (target) {
          URL.revokeObjectURL(target.previewUrl);
        }
        return prev.filter((img) => img.id !== id);
      });
    },
    [],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const onSelectClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/20 bg-black/30 p-6 text-center text-sm text-white/60"
      >
        <p>Arrastra imagenes aqui o haz click para subir</p>
        <button
          type="button"
          onClick={onSelectClick}
          className="rounded-full border border-white/25 px-4 py-1.5 text-xs text-white/80 hover:border-white/60"
        >
          Subir archivo
        </button>
        <p className="text-xs text-white/40">Formato recomendado: JPG o PNG de al menos 1280px de ancho.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">{error}</div>
      )}

      {images.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div key={image.id} className="group relative flex h-24 w-32 flex-col rounded-2xl border border-white/10 bg-[#1a1a1a]">
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <img src={image.previewUrl} alt={image.file.name} className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute -right-2 -top-2 z-20 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-[#c21e1e] text-xs font-bold text-white shadow-lg"
                aria-label="Eliminar imagen"
              >
                x
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-[11px] text-white/80">
                {index === 0 ? "Imagen principal" : `Imagen ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/40">Aun no has agregado imagenes.</p>
      )}
    </div>
  );
}
