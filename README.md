# @lp-labs/react-image-viewer

Native-modal image galleries with bounded zoom, pointer pan and90-degree rotation. React 18+ peer only; ESM, CommonJS and TypeScript included.

## Installation

```sh
npm install @lp-labs/react-image-viewer
```

## Quick Start

```jsx
import { useState } from 'react';
import { ImageViewer } from '@lp-labs/react-image-viewer';
export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>View image</button>
      <ImageViewer
        open={open}
        onOpenChange={setOpen}
        images={[
          {
            src: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200',
            alt: 'Landscape',
          },
        ]}
      />
    </>
  );
}
```

Replace the example image URL with your own permitted media.

## API

Props: images:[{src,alt}], open/defaultOpen=false, onOpenChange, index/defaultIndex=0, onIndexChange, maxZoom=8, label='Image viewer', className. Controlled open/index require corresponding callbacks. Controls navigate, zoom, rotate and reset. Left/Right changes image; +/- zoom, R rotates,0 resets, Escape uses native dialog cancellation. Pointer drag pans when zoomed. Native modal focus containment and restoration require showModal support. Errors render an alert. validateImageSource is exported.

## Benefits

| Area                   | Details                                          |
| ---------------------- | ------------------------------------------------ |
| Constrained transforms | Clamp zoom and pan to configured bounds.         |
| Safe source protocols  | Reject script URLs and SVG data URLs.            |
| Native modal           | Use dialog focus behavior and keyboard controls. |

## Customization

| Area        | Details                                                         |
| ----------- | --------------------------------------------------------------- |
| Gallery     | Provide source/alt pairs and controlled index/open state.       |
| Interaction | Set zoom maximum and callbacks.                                 |
| Security    | Apply an application domain allowlist and CSP to remote images. |

## Security And Limits

At most 1,000 images; maxZoom: 1–16, bounded pan, HTTP(S)/blob sources or raster base64 data images only. URL strings are capped at 8,192 characters; data URLs are capped at 2 MiB. URL credentials, script schemes and SVG data URLs are rejected. Browser image loading still contacts remote hosts; apply your own domain allowlist/CSP and avoid private URLs. referrerPolicy is no-referrer. Caller owns blob URL lifecycle. No raw HTML, SVG execution, canvas export, pinch-zoom, video or image proxy is provided. Broken assets are reported but not repaired; provide accurate alt text and test framing in your target viewport. Native dialog support is required.

## Support

[Donate via PayPal](https://www.paypal.me/LibinPrasanth). Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).

## License

MIT License. See the packaged [LICENSE](LICENSE) file.
