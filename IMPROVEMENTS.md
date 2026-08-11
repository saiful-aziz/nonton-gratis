# Improvement Plan — NontonGratis

Generated from full codebase review. Items are grouped by priority.

**Status:** ✅ All fixes applied (Fixes 1-18 completed)

---

## 🔴 High Priority

### ✅ 1. API Keys Exposed to Browser (COMPLETED)
**Files:** `src/lib/tmdb.ts`, `src/lib/subtitles.ts`, `src/app/api/subtitles/[tmdbId]/route.ts`

Both `NEXT_PUBLIC_TMDB_API_KEY` and `NEXT_PUBLIC_SUBDL_API_KEY` are bundled into the client JavaScript. Anyone can extract them from the page source or browser DevTools.

**Fix:**
- Rename to `TMDB_API_KEY` and `SUBDL_API_KEY` in `.env.local`
- Remove `NEXT_PUBLIC_` prefix from all references in code
- These are server-only modules so no client access is needed
- Update environment variables in Vercel/Hostinger dashboard

---

### ✅ 2. Redundant TMDB API Call on Movie Page (COMPLETED)
**File:** `src/app/movie/[id]/page.tsx`

`getMovieDetail()` already fetches credits via `append_to_response: "credits"`, but the movie page then calls `getMovieCredits()` separately — a duplicate API request on every page load.

**Fix:**
- Remove `getMovieCredits(movieId)` from the `Promise.all`
- Extend `MovieDetail` type to include `credits: { cast: Cast[] }`
- Read cast from `movie.credits.cast` directly

---

### ✅ 3. Missing `error.tsx` Boundary (COMPLETED)
**File:** `src/app/error.tsx` (missing)

No error boundary exists. If TMDB is down or rate-limits, users see a blank white page or raw stack trace. Also missing on individual routes like `/movie/[id]`.

**Fix:**
- Create `src/app/error.tsx` with a friendly "Terjadi kesalahan" UI and a retry button
- Optionally add per-route error files in `/movie/` and `/genre/`

---

### ✅ 4. Pagination URL Bug on Search Page (COMPLETED)
**File:** `src/app/search/page.tsx`

`basePath` is passed as `"/search?q=foo"` but `Pagination` appends its own query string, producing broken URLs like `/search?q=foo?q=foo&page=2`.

**Fix:**
- Pass `q` as a separate prop to `Pagination`, or
- Strip the query from `basePath` and let `Pagination` handle all params

---

## 🟠 Medium Priority

### ✅ 5. `handlePlay` Wipes All Server Statuses (COMPLETED)
**File:** `src/components/VideoPlayer.tsx`

```ts
setServerStatuses({ [activeServer]: "loading" }) // replaces entire object
```

This discards status info for all other servers when the user first hits Play.

**Fix:**
```ts
setServerStatuses((prev) => ({ ...prev, [activeServer]: "loading" }))
```

---

### ✅ 6. Download Proxy — Header Injection Risk (COMPLETED)
**File:** `src/app/api/subtitles/download/route.ts`

The `name` query param goes directly into `Content-Disposition` without sanitization. A `"` or newline character in the value can break the header.

**Fix:**
```ts
const safeName = name.replace(/[^\w\s.\-]/g, "_");
`Content-Disposition: attachment; filename="${safeName}"`
```

---

### 7. `zip` Parameter Has No Validation in Serve Route
**File:** `src/app/api/subtitles/[tmdbId]/serve/route.ts`

Anyone can call `/api/subtitles/123/serve?zip=../anything` with arbitrary values.

**Fix:**
```ts
if (!/^[\w\-]+\.zip$/.test(zip)) {
  return new NextResponse("Invalid zip parameter", { status: 400 });
}
```

---

### 8. `require("zlib")` Inside Function Body
**File:** `src/app/api/subtitles/[tmdbId]/serve/route.ts`

`require("zlib")` is called inside `extractEntry()` — bypasses tree-shaking and is an anti-pattern in TypeScript/ESM modules.

**Fix:**
```ts
import { inflateRawSync } from "zlib"; // top-level import
```

---

### 9. No Input Validation on `page` Param in List Pages
**Files:** `src/app/trending/page.tsx`, `src/app/top-rated/page.tsx`, `src/app/search/page.tsx`

`parseInt("abc")` returns `NaN`, which gets passed to TMDB causing a 422 error and page crash.

**Fix:**
```ts
const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
```

---

### 10. Genre Pages Missing Error Handling
**Files:** `src/app/genre/page.tsx`, `src/app/genre/[id]/page.tsx`

`getGenres()` has no try/catch. If TMDB errors, the page crashes with no recovery UI.

**Fix:**
- Wrap in try/catch and return empty state or call `notFound()`
- Add `revalidate = 86400` since genre list almost never changes

---

## 🟡 UX / Minor

### 11. "Sedang Tayang" and "Film Populer" Both Link to `/trending`
**File:** `src/app/page.tsx`

Both "Lihat Semua" links point to `/trending` but show different data (now playing vs popular). Users who click are taken to unrelated content.

**Fix:**
- Create `/now-playing` and `/popular` pages, or
- Remove the `href` prop from those rows so no misleading link is shown

---

### 12. No "Subtitle Not Available" Message in Player
**File:** `src/components/SubtitleOverlay.tsx`

When no subtitles are found, the overlay returns `null` — but the player's "ready" banner still says "Gunakan tombol Subtitle". The button doesn't exist, leaving users confused.

**Fix:**
- Pass subtitle availability down from `VideoPlayer` to `SubtitleOverlay`, or
- Show a small "Subtitle tidak tersedia" text in the controls area when `tracks.length === 0`

---

### 13. Movie Detail Page Uses `force-dynamic` Instead of ISR
**File:** `src/app/movie/[id]/page.tsx`

`force-dynamic` re-fetches TMDB on every single visit. Movie metadata rarely changes.

**Fix:**
```ts
export const revalidate = 3600; // cache for 1 hour
```

(Note: test that this doesn't cause build-time pre-rendering issues again. May need `generateStaticParams` returning `[]` to avoid it.)

---

### 14. Mobile Search Has No Submit Button
**File:** `src/components/Navbar.tsx`

iOS virtual keyboard doesn't show a "Search" return key without `type="search"` or an explicit submit button.

**Fix:**
```tsx
<input type="search" ... />
```
Or add a visible search icon button inside the form.

---

### 15. Cast Images Missing `sizes` Prop
**File:** `src/app/movie/[id]/page.tsx`

Cast photos are displayed at 96×96px but the `<Image>` has no `sizes` hint, so Next.js image optimization can't pick the right size.

**Fix:**
```tsx
<Image ... sizes="96px" />
```

---

### 16. Subtitle List Uses Array Index as Key
**File:** `src/components/SubtitleList.tsx`

```tsx
subtitles.slice(0, 5).map((sub, i) => <div key={i}>
```

Array index keys cause React reconciliation issues if the list order changes.

**Fix:**
```tsx
subtitles.slice(0, 5).map((sub) => <div key={sub.url}>
```

---

### 17. Mobile Menu Toggle Missing `aria-label`
**File:** `src/components/Navbar.tsx`

The hamburger button has no accessible label — screen readers say "button" with no context.

**Fix:**
```tsx
<button aria-label={menuOpen ? "Tutup menu" : "Buka menu"} ...>
```

---

### 18. Subtitle Sync UX Not Clearly Explained
**File:** `src/components/SubtitleOverlay.tsx`

The subtitle timer is manually controlled but the player's "ready" message implies it works automatically. New users enable a subtitle and see it out of sync with no explanation.

**Fix:**
- Add a small info tooltip or one-line note: "Sync subtitle manual — tekan Play Sub lalu sesuaikan waktu"
- Or auto-start the subtitle timer when a track is loaded (it already does this, but the timer starts from 0 regardless of video position)

---

## Status Tracker

| # | Item | Priority | Status |
|---|------|----------|--------|
| 1 | API keys exposed | 🔴 High | ✅ Done |
| 2 | Redundant credits API call | 🔴 High | ✅ Done |
| 3 | Missing error.tsx | 🔴 High | ✅ Done |
| 4 | Pagination URL bug | 🔴 High | ✅ Done |
| 5 | handlePlay wipes server statuses | 🟠 Medium | ✅ Done |
| 6 | Download header injection | 🟠 Medium | ✅ Done |
| 7 | zip param no validation | 🟠 Medium | ✅ Done |
| 8 | require("zlib") inside function | 🟠 Medium | ✅ Done |
| 9 | NaN page param | 🟠 Medium | ✅ Done |
| 10 | Genre pages no error handling | 🟠 Medium | ✅ Done |
| 11 | Wrong "Lihat Semua" links | 🟡 Minor | ✅ Done |
| 12 | No subtitle unavailable message | 🟡 Minor | ✅ Already handled in existing code |
| 13 | Movie page force-dynamic | 🟡 Minor | ✅ Done |
| 14 | Mobile search no submit button | 🟡 Minor | ✅ Already using type="search" |
| 15 | Cast images no sizes prop | 🟡 Minor | ✅ Done |
| 16 | Subtitle list index key | 🟡 Minor | ✅ Done |
| 17 | Mobile menu no aria-label | 🟡 Minor | ✅ Already has aria-label |
| 18 | Subtitle sync UX unclear | 🟡 Minor | ✅ Done |
