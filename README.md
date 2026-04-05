# The Seventh Sip

The Seventh Sip is a Gen Z focused, campus-first coffee website built as a static single-page experience. It showcases the menu, lets users build a cart, and generates a ready-to-send WhatsApp order message.

## What This Project Includes

- Landing page with brand story and campus positioning
- Menu sections for coffee/shakes, bites, and fries
- Live cart with quantity controls and totals
- Context-aware add-ons (for example Chocolate Crush or Extra Cheese)
- Automatic campus service fee handling
- Order form that generates a WhatsApp-friendly order draft
- Copy-to-clipboard order text helper
- Mobile-friendly layout with reveal animations and floating cart CTA

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (no framework)
- Google Fonts (Syne, Urbanist)

## Project Structure

```text
.
|- index.html
|- styles.css
|- script.js
|- robots.txt
|- sitemap.xml
|- CNAME
`- images/
```

## Run Locally

Because this is a static site, you can run it in any simple way:

1. Open the project folder in VS Code.
2. Open `index.html` directly in a browser, or use a local server.
3. If you want a local server, one option is:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Quick Customization Guide

### 1. Change WhatsApp Order Number

Update `WHATSAPP_NUMBER` in `script.js`.

### 2. Edit Menu Items and Pricing

Menu cards live in `index.html`.

- Each item uses `data-name` and `data-price`
- Example: `<article class="menu-card" data-name="Classic Cold Coffee" data-price="37">`

### 3. Adjust Add-ons Logic

In `script.js`, update:

- `ADD_ONS`
- `ADD_ON_EXCLUDED_ITEMS`

### 4. Update Theme Colors

In `styles.css`, edit CSS variables under `:root` to change the black-brown visual system.

### 5. Update Domain and SEO Files

- Update `CNAME` if the custom domain changes
- Keep `robots.txt` and `sitemap.xml` aligned with the live domain

## Deployment

This project is ready for static hosting (GitHub Pages, Netlify, Vercel static output, or any CDN host).

If deploying to GitHub Pages with a custom domain:

1. Push repository changes.
2. Enable Pages on the desired branch.
3. Confirm `CNAME` contains your domain.

## Maintainers

Brand: The Seventh Sip
Concept: Coffee in Campus
