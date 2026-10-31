'use client';
import { useEffect, useId, useRef, useState } from 'react';
export interface ViewerImage {
  src: string;
  alt: string;
}
export function validateImageSource(source: string, base = 'https://localhost/'): string {
  if (source.length > 2097152) throw new RangeError('Image source limit exceeded.');
  if (source.startsWith('data:')) {
    if (!/^data:image\/(png|jpeg|gif|webp|avif);base64,[A-Za-z0-9+/=\s]+$/.test(source))
      throw new TypeError('Only raster base64 data images are allowed.');
    return source;
  }
  const url = new URL(source, base);
  if (
    !['http:', 'https:', 'blob:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    source.length > 8192
  )
    throw new TypeError('Unsafe image URL.');
  return source;
}
export interface ImageViewerProps {
  images?: readonly ViewerImage[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  maxZoom?: number;
  label?: string;
  className?: string;
}
export function ImageViewer({
  images = [],
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  index: controlledIndex,
  defaultIndex = 0,
  onIndexChange,
  maxZoom = 8,
  label = 'Image viewer',
  className,
}: ImageViewerProps) {
  if (
    images.length > 1000 ||
    !Number.isFinite(maxZoom) ||
    maxZoom < 1 ||
    maxZoom > 16 ||
    images.some((image) => typeof image.alt !== 'string')
  )
    throw new RangeError('Invalid gallery limits or alt text.');
  for (const image of images) validateImageSource(image.src);
  const [internalOpen, setOpen] = useState(defaultOpen);
  const open = controlled ?? internalOpen;
  const [internalIndex, setIndex] = useState(defaultIndex);
  const requested = controlledIndex ?? internalIndex;
  if (!Number.isInteger(requested) || requested < 0)
    throw new RangeError('Image index must be nonnegative.');
  const index = Math.min(requested, Math.max(0, images.length - 1));
  const image = images[index];
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    pan: {
      x: number;
      y: number;
    };
  } | null>(null);
  const id = useId();
  const changeOpen = (next: boolean) => {
    if (controlled === undefined) setOpen(next);
    onOpenChange?.(next);
  };
  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setError(null);
  };
  const move = (next: number) => {
    if (next < 0 || next >= images.length) return;
    if (controlledIndex === undefined) setIndex(next);
    onIndexChange?.(next);
    reset();
  };
  useEffect(() => {
    reset();
  }, [index]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    try {
      if (!dialog.current?.showModal) throw new Error('Native dialog support is required.');
      if (!dialog.current.open) dialog.current.showModal();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
    return () => {
      dialog.current?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  return (
    <>
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-title`}
        className={className}
        style={{
          width: 'calc(100vw - 32px)',
          height: 'calc(100dvh - 32px)',
          maxWidth: 'none',
          maxHeight: 'none',
          padding: 12,
          boxSizing: 'border-box',
        }}
        onCancel={(event) => {
          event.preventDefault();
          changeOpen(false);
        }}
        onClose={() => {
          if (open) changeOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.defaultPrevented || event.nativeEvent.isComposing) return;
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            changeOpen(false);
            return;
          }
          if (event.target instanceof window.HTMLInputElement) return;
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            move(index - 1);
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            move(index + 1);
          }
          if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            setZoom((value) => Math.min(maxZoom, value + 0.25));
          }
          if (event.key === '-') {
            event.preventDefault();
            setZoom((value) => Math.max(1, value - 0.25));
          }
          if (event.key === 'r') setRotation((value) => (value + 90) % 360);
          if (event.key === '0') reset();
        }}
      >
        <header style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 id={`${id}-title`} style={{ fontSize: '1rem', margin: 0 }}>
            {label}
          </h2>
          <button type="button" onClick={() => changeOpen(false)}>
            Close
          </button>
          <button
            type="button"
            aria-label="Previous image"
            disabled={index === 0}
            onClick={() => move(index - 1)}
          >
            {'<'}
          </button>
          <output aria-live="polite">
            {images.length ? index + 1 : 0} / {images.length}
          </output>
          <button
            type="button"
            aria-label="Next image"
            disabled={index >= images.length - 1}
            onClick={() => move(index + 1)}
          >
            {'>'}
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoom <= 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
          >
            -
          </button>
          <output>{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoom >= maxZoom}
            onClick={() => setZoom((value) => Math.min(maxZoom, value + 0.25))}
          >
            +
          </button>
          <button type="button" onClick={() => setRotation((value) => (value + 90) % 360)}>
            Rotate
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </header>
        <div
          style={{
            height: 'calc(100% - 64px)',
            minHeight: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            touchAction: 'none',
          }}
          onPointerDown={(event) => {
            if (zoom <= 1 || event.button !== 0) return;
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, pan };
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            const active = drag.current;
            if (!active || active.id !== event.pointerId) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            setPan({
              x: Math.max(
                (-bounds.width * zoom) / 2,
                Math.min((bounds.width * zoom) / 2, active.pan.x + event.clientX - active.x),
              ),
              y: Math.max(
                (-bounds.height * zoom) / 2,
                Math.min((bounds.height * zoom) / 2, active.pan.y + event.clientY - active.y),
              ),
            });
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          {image ? (
            <img
              src={image.src}
              alt={image.alt}
              draggable={false}
              referrerPolicy="no-referrer"
              onError={() => setError('Image failed to load.')}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                userSelect: 'none',
              }}
            />
          ) : (
            <p>No images</p>
          )}
        </div>
        {error && <p role="alert">{error}</p>}
      </dialog>
      {error && open && !dialog.current?.open && <p role="alert">{error}</p>}
    </>
  );
}
export default ImageViewer;
