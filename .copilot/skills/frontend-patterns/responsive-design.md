# Responsive Design Patterns

## Mobile-First Approach

Write base styles for mobile, then add complexity via `min-width` breakpoints:

```css
/* Base: mobile */
.container { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) { .container { padding: 2rem; } }

/* Desktop and up */
@media (min-width: 1024px) { .container { max-width: 1200px; margin: 0 auto; } }
```

## Standard Breakpoints

| Name | Width | Typical Devices |
|------|-------|-----------------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

Use these as `min-width` queries. Avoid more than 4-5 breakpoints.

## Fluid Typography

Use `clamp()` for fluid scaling without breakpoints:

```css
/* Min 1rem, preferred 2.5vw, max 2rem */
h1 { font-size: clamp(1rem, 2.5vw + 0.5rem, 2rem); }

/* Body text */
body { font-size: clamp(0.875rem, 1vw + 0.5rem, 1.125rem); }
```

## Container Queries

Respond to parent container size, not viewport:

```css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}
```

## CSS Grid vs Flexbox

| Use Grid For | Use Flexbox For |
|-------------|----------------|
| 2D layouts (rows + columns) | 1D layouts (row OR column) |
| Page-level structure | Component-level alignment |
| Complex grid placements | Centering, spacing, wrapping |
| Named areas and tracks | Flexible items with grow/shrink |

```css
/* Grid: page layout */
.page {
  display: grid;
  grid-template: "header header" auto
                 "sidebar main" 1fr
                 "footer footer" auto / 250px 1fr;
}

/* Flexbox: navigation items */
.nav { display: flex; gap: 1rem; align-items: center; }
```

## Responsive Images

```html
<!-- srcset for resolution switching -->
<img
  src="photo-400.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Description"
  loading="lazy"
/>

<!-- picture for art direction -->
<picture>
  <source media="(min-width: 1024px)" srcset="hero-wide.webp" type="image/webp" />
  <source media="(min-width: 768px)" srcset="hero-medium.webp" type="image/webp" />
  <img src="hero-small.jpg" alt="Hero" />
</picture>
```

## Touch vs Mouse

```css
/* Larger tap targets on touch devices */
@media (pointer: coarse) {
  button { min-height: 44px; min-width: 44px; }
}

/* Hover effects only on devices that support hover */
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
}
```

## Accessibility in Responsive Layouts

- Maintain logical reading order in DOM regardless of visual layout
- Ensure focus order follows visual order (`order` in CSS can break this)
- Touch targets: minimum 44x44px
- Don't hide essential content on small screens — restructure instead
- Test with screen readers at each breakpoint

## Checklist
- [ ] Mobile-first `min-width` breakpoints
- [ ] Fluid typography with `clamp()`
- [ ] Images use `srcset`/`sizes` or `<picture>`
- [ ] Touch targets are 44x44px minimum
- [ ] Layout tested at all breakpoints
- [ ] No horizontal scrolling at any viewport width
- [ ] Focus order matches visual order
