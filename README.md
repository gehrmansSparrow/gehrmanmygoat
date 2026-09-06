# Traditions Mockup v2

This version adds dynamic date/time behavior and an order-details screen.

## Features

- Uses the user's device date and time when the page first opens.
- The gear icon refreshes the displayed time/date to the current device time.
- "View order details" opens a second screen based on the supplied reference screenshot.
- The order-details pickup date/time matches the current app date/time.
- The container return deadline is always 3 calendar days after the app date.
- "Back" returns to the main screen.
- "show QR code" returns to the main screen and scrolls to the demo QR.
- The QR image is intentionally a harmless demo QR.

## Deploy

Upload these files to the root of a GitHub repository and connect that repository to Netlify.
No build command is required because this is a plain static site.

- The settings gear now opens a bottom-sheet menu.
- Order number defaults to 131 and can be changed from settings.
- The order number updates on both the main screen and order-details screen.
- Purple links that are not implemented still react visually when tapped, but do not navigate.

- The top area (X, title, settings icon, and order number) is now fixed in place.
- Only the content beginning with “Preparing Your Order” scrolls.
- The main scroll area uses iPhone momentum/rubber-band scrolling.
- Pulling slightly past the top or bottom reveals a lighter gray background, giving a Snapchat-like overscroll feel without adding permanent extra content.

- This build intentionally uses the v4 settings-cog implementation/layout because that version rendered correctly.
- The QR image is the exact uploaded dummy QR file.
- Recycle artwork uses the closest supplied reference asset when available.

- Final layout tuned for modern iPhone widths (roughly 375–440 CSS px, covering iPhone 14 through newer comparable models).
- The black fixed header contains only the X and “Traditions at Scott - Reusepass”.
- The lighter gray fixed row contains only the order number and settings cog.
- Typography and spacing were reduced slightly so the page matches the supplied iPhone screenshots more closely when opened on-device.
