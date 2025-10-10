# Client Logos Directory

## 📁 Purpose
This directory contains client logos displayed in the Trust Bar carousel on the homepage.

## 📐 Image Specifications (MANDATORY)

All client logos **MUST** follow these exact specifications to ensure visual consistency and optimal performance:

### Technical Requirements:
- **Format**: `.webp` (WebP only, no PNG/JPG)
- **Dimensions**: `200px width × 80px height` (ratio 2.5:1 landscape)
- **Resolution**: 72 DPI (web standard)
- **Color Mode**: Grayscale or monochromatic preferred (for grayscale effect)
- **Background**: Transparent (alpha channel)
- **File Size**: `<15 KB` per logo (optimized)

### Naming Convention:
```
client-1.webp
client-2.webp
client-3.webp
...
client-10.webp
```

**Current Status**: 10 placeholder filenames defined in `TrustBar.astro`

---

## 🎨 Visual Guidelines

### Logo Appearance:
1. **Default State**: 
   - Displayed in grayscale
   - 60% opacity
   - Height: 48px (width auto-scales maintaining ratio)

2. **Hover State**: 
   - Full color (if logo has color)
   - 100% opacity
   - Smooth transition (300ms)

3. **Carousel Behavior**:
   - Infinite horizontal scroll (40s loop)
   - Pauses on hover (user control)
   - Respects `prefers-reduced-motion` (accessibility)

---

## 🔧 How to Add/Replace Logos

### Step 1: Prepare Logo Files
1. Obtain high-quality logo from client (SVG, PNG, or original file)
2. Convert to grayscale or monochromatic version
3. Resize to exactly **200×80px**
4. Export as WebP with quality 85-90
5. Verify file size is **<15 KB**

### Step 2: Optimize with Tools
Use one of these tools to ensure optimal compression:

**Command Line (cwebp)**:
```bash
cwebp -q 85 input.png -o client-1.webp
```

**Online Tools**:
- [Squoosh.app](https://squoosh.app/) - Visual compression tool
- [CloudConvert](https://cloudconvert.com/) - Batch conversion

**ImageMagick**:
```bash
convert input.png -resize 200x80 -quality 85 client-1.webp
```

### Step 3: Add Files to Directory
Place optimized `.webp` files in this directory:
```
/public/images/trust/clients/client-1.webp
/public/images/trust/clients/client-2.webp
...
```

### Step 4: Update Component (if needed)
If you need to change logo names or add more than 10 logos:

Edit `src/components/home/TrustBar.astro`:
```astro
const clientLogos = [
  { name: "Client Name 1", filename: "client-1.webp" },
  { name: "Client Name 2", filename: "client-2.webp" },
  // Add more entries...
];
```

**Note**: The `name` attribute is used for the `alt` text (accessibility).

---

## ✅ Quality Checklist

Before adding a logo, verify:

- [ ] Format is `.webp` (not PNG, JPG, or SVG)
- [ ] Dimensions are exactly **200×80 pixels**
- [ ] File size is **under 15 KB**
- [ ] Background is **transparent** (no white box around logo)
- [ ] Logo is **readable** at 48px height (display size)
- [ ] Logo works in **grayscale** (default carousel state)
- [ ] Filename follows pattern: `client-[number].webp`
- [ ] Alt text is descriptive in `TrustBar.astro`

---

## 🚫 Common Mistakes to Avoid

❌ **Don't**:
- Use PNG or JPG format (WebP only)
- Upload logos larger than 15 KB
- Use incorrect dimensions (must be 200×80px)
- Include white/colored backgrounds (must be transparent)
- Use vertical or square logos (must be 2.5:1 ratio)
- Hardcode logo names in alt text (use i18n translations)

✅ **Do**:
- Compress aggressively while maintaining readability
- Test logos at 48px height (actual display size)
- Use grayscale versions for better carousel aesthetics
- Keep naming convention consistent
- Update alt text for accessibility

---

## 📊 Current Inventory

| Filename | Client Name | Status | File Size | Notes |
|----------|-------------|--------|-----------|-------|
| client-1.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-2.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-3.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-4.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-5.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-6.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-7.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-8.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-9.webp | [Pending] | ❌ Missing | - | Add real logo |
| client-10.webp | [Pending] | ❌ Missing | - | Add real logo |

**Total**: 0/10 logos uploaded

---

## 🎯 Performance Impact

Each logo adds to the page weight. With 10 logos at <15 KB each:
- **Total weight**: ~150 KB maximum
- **Lazy loading**: ✅ Enabled (below-the-fold)
- **Carousel duplication**: Logos load once, displayed twice (seamless loop)
- **Performance budget**: Within limits (arquitecture.md §14)

---

## 🔍 Testing

After adding logos, test:

1. **Visual Check**: Open homepage, scroll to Trust Bar
2. **Grayscale Effect**: Logos should be grayed out by default
3. **Hover Effect**: Logos should gain color/opacity on hover
4. **Animation**: Carousel should scroll smoothly left
5. **Pause on Hover**: Animation should stop when hovering over track
6. **Responsive**: Test on mobile, tablet, desktop
7. **Accessibility**: Verify with screen reader (VoiceOver/NVDA)
8. **Performance**: Run Lighthouse (should maintain LCP <2.5s)

---

## 📝 Architecture Compliance

This implementation follows `arquitecture.md`:

- ✅ **§2 (JS mínimo)**: Pure CSS animation, no JavaScript
- ✅ **§5 (i18n)**: Alt text via astro-i18n translations
- ✅ **§7 (WCAG 2.2 AA)**: `prefers-reduced-motion` support, pausable animation
- ✅ **§10 (Imágenes)**: WebP, <15KB, lazy loading, transparent bg
- ✅ **§14 (Performance)**: Optimized file sizes, within budget

---

**Last Updated**: January 2025  
**Maintained By**: Development Team  
**Related Files**: 
- `src/components/home/TrustBar.astro`
- `src/i18n/en.json` (home.trustBar.*)
