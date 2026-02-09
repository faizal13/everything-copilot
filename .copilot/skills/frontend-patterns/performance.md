# Frontend Performance Optimization

## Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## Code Splitting

Split code at route and feature boundaries:

```jsx
// Route-level splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

```js
// Feature-level splitting (load on interaction)
const handleExport = async () => {
  const { exportToPDF } = await import('./utils/export');
  exportToPDF(data);
};
```

## Bundle Analysis

```bash
# Webpack
npx webpack-bundle-analyzer stats.json

# Vite
npx vite-bundle-visualizer

# Next.js
ANALYZE=true next build
```

**Rules:**
- No single chunk > 200KB (gzipped)
- Tree shake unused exports (use ESM, avoid barrel files that re-export everything)
- Replace large libraries with smaller alternatives (date-fns over moment, preact over react for widgets)

## Image Optimization

```jsx
// Next.js Image
import Image from 'next/image';
<Image src="/hero.jpg" width={1200} height={600} alt="Hero"
       priority  // for above-the-fold
       placeholder="blur" blurDataURL={blurHash} />

// Native lazy loading
<img src="photo.jpg" loading="lazy" decoding="async" alt="Photo" />
```

**Format priority:** AVIF > WebP > JPEG/PNG
**Sizing:** Never serve images larger than displayed size

## List Virtualization

For lists with 100+ items, render only visible rows:

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((vItem) => (
          <div key={vItem.key} style={{
            position: 'absolute', top: vItem.start, height: vItem.size, width: '100%',
          }}>
            {items[vItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Font Loading

```css
/* Preload critical fonts */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately, swap when loaded */
}
```

```html
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

**Rules:** Use `font-display: swap`, limit to 2-3 font files, prefer WOFF2.

## Resource Hints

```html
<!-- Preconnect to critical origins -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />

<!-- Prefetch next likely page -->
<link rel="prefetch" href="/dashboard" />

<!-- Preload critical resources -->
<link rel="preload" href="/critical.css" as="style" />
```

## Performance Budget

| Resource | Budget |
|----------|--------|
| JavaScript (initial) | < 200KB gzipped |
| CSS (initial) | < 50KB gzipped |
| Fonts | < 100KB total |
| LCP image | < 200KB |
| Total page weight | < 1MB |

## Checklist
- [ ] LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1
- [ ] Route-level code splitting implemented
- [ ] Images optimized (WebP/AVIF, srcset, lazy loading)
- [ ] Bundle analyzed — no oversized chunks
- [ ] Long lists virtualized (100+ items)
- [ ] Critical fonts preloaded with `font-display: swap`
- [ ] Resource hints for third-party origins
- [ ] No layout shift from dynamically loaded content
