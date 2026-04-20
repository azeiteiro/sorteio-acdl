# Chess Background Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a CSS-only full-page background that starts solid black at the top and transitions into a checkerboard pattern underneath.

**Architecture:** Use CSS multiple backgrounds on the `body` element. Layer a `linear-gradient` (black to transparent) over two repeating `conic-gradient` layers that create a checkerboard pattern.

**Tech Stack:** Vanilla CSS

---

### Task 1: Update Body Background Style

**Files:**
- Modify: `style.css`

**Step 1: Write the updated background CSS**

Replace the current `body { background: ... }` rule with the new multiple background rules. We will use a repeating checkerboard pattern using conic gradients for sharp squares, and overlay a linear gradient.

```css
body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
  /* Top layer is the mask, bottom two are the check pattern */
  background: 
    /* Overlay fade: solid black at top, fading to transparent at the bottom */
    linear-gradient(to bottom, #000000 0%, transparent 100%),
    /* Checkerboard pattern */
    conic-gradient(from 90deg at 2px 2px, #1a1a1a 90deg, #0a0a0a 0) 0 0/40px 40px,
    conic-gradient(from 90deg at 2px 2px, #1a1a1a 90deg, #0a0a0a 0) 20px 20px/40px 40px;
  background-attachment: fixed; /* Ensures the pattern stays put while scrolling */
  min-height: 100vh;
  padding: 20px;
  color: #fff; /* Ensure text remains readable against a dark background */
}
```

**Step 2: Commit**

```bash
git add style.css
git commit -m "style: replace background with fading chess pattern"
```
