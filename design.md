# Go Courier Service Frontend Design Brief

This file is the design source of truth for building the Go Courier Service customer frontend. The app is a college batch-based food delivery product for Indian students, with a dark, energetic Swiggy/Zomato-style experience and strong time-based ordering cues.

## Product Direction

Go Courier Service should feel fast, student-friendly, and utility-first. The UI is dark, compact, high-contrast, and optimized for repeated ordering before a batch cutoff. Avoid landing-page patterns. The first screen should always feel like an actual app flow.

Primary product ideas:

- Batch ordering is the core mechanic.
- Students order from restaurants near their selected campus.
- Cart lock countdown is always clear before checkout.
- Checkout is focused and distraction-free.
- Errors and empty states should feel helpful, not generic.

## Visual Style

Use the exact product-mockup direction from the generated references:

- Dark studio/app background.
- Realistic iPhone 15 Pro proportions for mockups and previews.
- High-fidelity dark UI, not wireframes.
- Rounded cards, subtle shadows, and clean spacing.
- Handwritten annotation labels only for showcase/mockup pages, not inside the production app.
- Bottom color palette strip only for design showcase pages, not inside the production app.

For the real app, implement the screens as a mobile-first responsive web/PWA. The main app content should be centered with a max mobile width around `430px`, while still working on narrow phones.

## Design Tokens

### Colors

```css
:root {
  --bg: #0D0D0F;
  --card: #1A1A1E;
  --brand: #FF2E63;
  --urgent: #D4FF4F;
  --success: #00E28A;
  --danger: #FF4747;
  --text: #F5F5F7;
  --muted: #9A9AA2;
  --border: rgba(245, 245, 247, 0.10);
  --surface-2: #24242A;
}
```

Color usage rules:

- Use `--brand` for primary CTAs, active nav state, key links, selected borders, and brand touches.
- Use `--urgent` only for countdowns, cutoff urgency, delivery estimates, and time-sensitive pills.
- Use `--success` for paid/confirmed states, cart success pills, checkmarks, and add buttons.
- Use `--danger` for invalid OTP, payment failure, unavailable/refunded item states, and destructive errors.
- Do not use blue as a primary app color.
- Do not create a one-hue palette. Keep the dark base balanced with magenta, lime, green, and red accents.

### Typography

- Headings, prices, timers, totals: `Space Grotesk`, bold.
- Body, labels, descriptions, helper text: `General Sans`, regular/medium.
- Fallback stack: `Space Grotesk, Inter, system-ui, sans-serif` and `General Sans, Inter, system-ui, sans-serif`.
- Do not use viewport-width font scaling.
- Letter spacing should be `0` unless a specific all-caps label needs a slight positive value.

Suggested type scale:

- App title: 42-48px, 700.
- Screen heading: 26-32px, 700.
- Section heading: 18-22px, 700.
- Timer: 48-60px, 700, tabular numerals.
- Price/total: 18-28px, 700.
- Body: 14-16px, 400/500.
- Caption/helper: 11-13px, 400/500.

### Shape, Spacing, and Elevation

- App shell padding: 18-20px.
- Card radius: 16-20px.
- Button radius: 12px.
- Input radius: 14-16px.
- Bottom sheets: 24px top radius.
- Icon button size: 40-44px.
- Minimum tap target: 44px.
- Card spacing: 12-16px.
- Section spacing: 24-32px.
- CTAs may use a subtle magenta glow: `0 12px 36px rgba(255, 46, 99, 0.28)`.
- Keep text inside buttons from wrapping awkwardly. Use icons for obvious actions.

## Icons and Media

- Prefer lucide icons for production UI: scooter/delivery, map-pin, search, home, shopping-cart, receipt, user, arrow-left, share, plus, minus, check, alert-triangle, clock, lock, utensils.
- Food images should be realistic and appetizing: paneer pizza, biryani, burgers, rolls, garlic bread, shakes.
- If real assets are unavailable, use a small curated local image set or stable seeded placeholder images. Avoid gray placeholders in final UI.
- Veg/non-veg indicators should be small square marks: green for veg, red for non-veg.

## Navigation Model

Primary tabs:

- Home
- Cart
- Orders
- Profile

Hide bottom nav on focused flows:

- Splash
- Phone entry
- OTP verification
- Campus selector
- Checkout
- Payment loading
- Order confirmation
- Order tracking
- Modal/sheet overlays when the background is blocked

Show bottom nav on browse/menu/cart flows where specified:

- Home / Browse
- Restaurant Menu
- Cart

## Core Components

Build these as reusable primitives:

- `AppShell`: mobile max-width container, safe-area padding, app background.
- `ScreenHeader`: back button, title, optional right action.
- `BottomNav`: Home, Cart, Orders, Profile with badge support.
- `PrimaryButton`: magenta filled CTA with optional trailing icon.
- `SecondaryButton`: outlined or text-only action.
- `TextInput`: dark card input with helper/error states.
- `CountdownCard`: prominent timer display with urgency color state.
- `RestaurantCard`: thumbnail, name, cuisine, rating, optional tag.
- `MenuItemCard`: veg indicator, item details, price, image, add/stepper control.
- `QuantityStepper`: fixed-width `- qty +` control.
- `CartBar`: sticky menu cart summary.
- `BillSummary`: subtotal, fee, divider, total.
- `StatusPill`: success, urgency, danger, neutral.
- `BottomSheet`: dimmed/blurred background, handle, action stack.
- `EmptyStateBlock`: icon, heading, subtext, optional action.
- `ErrorStateBlock`: icon, heading, subtext, action set.

## Screen Specifications

### Screen 1: Splash

Purpose: brand entry.

Content:

- Center delivery scooter logo in `--brand` with subtle motion lines.
- Huge `Go Courier` in Space Grotesk bold.
- `Service` below in `--urgent`, slightly smaller.
- Tagline: `Beat the clock. Eat on time.`
- Very faint outlined food doodles in the background: pizza slice, burger, biryani bowl.

Rules:

- No buttons.
- No bottom nav.
- Pure splash state.

### Screen 2: Phone Entry

Purpose: collect phone number.

Content:

- Small logo top-left.
- Subtle scooter icon near top center.
- Heading: `What's your number?`
- Subtext: `We'll shoot you a code. No spam, pinky promise.`
- Phone input card with India prefix `+91`, divider, placeholder `98765 43210`.
- CTA: `Send OTP ->`
- Footer: `By continuing, you're cool with our Terms & Privacy`

Rules:

- No bottom nav.
- Numerals use Space Grotesk.
- CTA is full-width magenta.
- If the OTP request is rate-limited by the backend, keep the user on this screen and show the rate-limit state below.

Rate-limit state:

- Triggered when the OTP request API returns the backend cap state: 3 OTP requests per phone number per 10 minutes.
- Disable `Send OTP ->` while the cooldown is active.
- Show a danger/urgent helper card below the phone input:
  - Heading: `Too many codes`
  - Body: `Try again in 08:42.`
  - Secondary note: `You can request 3 codes every 10 minutes.`
- Countdown should update every second and re-enable the CTA when it reaches zero.
- Use `--danger` for the helper heading/icon and `--urgent` only for the remaining cooldown time.

### Screen 3: OTP Verification

Purpose: verify phone number.

Content:

- Header: `<- Back`
- Heading: `Check your messages`
- Subtext: `Code sent to +91 98765 43210` with `Edit` link in magenta.
- Four separate OTP boxes.
- Example state: `4`, `7`, `2`, empty box with magenta cursor.
- Countdown: `Resend code in 00:28`, with only `00:28` in `--urgent`.
- CTA: `Verify ->`
- Dark iOS-style numeric keypad.

Rules:

- No bottom nav.
- OTP boxes are fixed-size and centered.

### Screen 4: Campus Selector

Purpose: select campus before showing restaurants.

Content:

- Header: `<- Back` and `Pick your campus`
- Subtext: `We'll only show restaurants near you`
- Search input: `Search campuses...`
- Campus rows:
  - Manipal University, Manipal, Karnataka, selected
  - MIT Manipal, Manipal, Karnataka
  - VIT Vellore, Vellore, Tamil Nadu
  - SRM Chennai, Chennai, Tamil Nadu
  - Christ University, Bangalore, Karnataka
  - BITS Pilani, Pilani, Rajasthan
- Selected row has magenta left border and green check.
- Sticky CTA: `Let's go ->`

Rules:

- No bottom nav.
- Rows must be scrollable if content overflows.

### Screen 5: Invalid OTP

Purpose: OTP error state.

Content:

- Same layout as OTP verification.
- Four boxes filled with digits.
- OTP boxes have red border and subtle red glow.
- Error: `Wrong code. Try again.`
- Resend active link: `Resend code now`
- CTA: `Verify ->`, disabled/dimmed until re-entry.
- Keypad remains visible.

Rules:

- No bottom nav.
- Error state should be obvious but not visually overwhelming.

### Screen 6: Home / Browse

Purpose: browse restaurants for selected campus.

Content:

- Header left: small `Go Courier` logo.
- Header right: location selector `Manipal Univ` with map pin and chevron, magenta.
- Hero countdown card:
  - Label: `Beat the clock`
  - Huge timer: `34:12` in `--urgent`
  - Note: `Cart locks when timer hits zero`
- Search: `Search restaurants or dishes`
- Offer cards:
  - `Flat INR 50 off - First order`
  - `Free delivery today`
- Section: `Restaurants`
- Restaurant cards:
  - The Rising Cafe, North Indian/Chinese, rating 4.2, Hot tag
  - Flavor Town, Snacks/Fast Food, rating 4.5, Fast tag
  - Guru Kripa Hotel, South Indian, rating 4.1
  - SpiceCraft, Biryani/Mughlai, rating 4.3, Hot tag
- Bottom nav with Home active.

Rules:

- Timer starts lime and shifts toward magenta as time runs low.
- Food containers must not show delivery time unless the screen explicitly asks for it.
- Search filters the Home restaurant list inline as the user types. Do not navigate to a separate search results route for the MVP.
- If no restaurants or dishes match the inline query, show the `No Search Results` empty state in the Home content area below the search bar.

### Screen 7: Restaurant Menu

Purpose: browse and add items from one restaurant.

Content:

- Header: back, `The Rising Cafe`, share icon.
- Subheader: rating 4.2, cuisine, distance 2.1 km, time 25 min.
- Section: `Recommended`
- Menu items:
  - Veg `Paneer Pizza (8 in)`, price INR 215, stepper qty 1.
  - Veg `Garlic Bread`, price INR 79, green outline ADD.
  - Non-veg `Chicken Biryani`, price INR 189, stepper qty 2.
  - Veg `Chocolate Shake`, price INR 99, green outline ADD.
- Sticky cart bar:
  - Left: `3 items - INR 618`
  - Right: `View Cart ->`
- Bottom nav below cart bar.

Rules:

- Quantity stepper uses fixed dimensions.
- ADD uses green outline when qty is zero.
- Cart bar stays above bottom nav.

### Screen 8: Cart

Purpose: review restaurant cart.

Content:

- Header: back, `Your Cart`
- Restaurant card: thumbnail, `The Rising Cafe`, `3 items`
- Item rows:
  - Paneer Pizza (8 in), INR 215, qty 1
  - Chicken Biryani, INR 378, qty 2, small `x2`
  - Garlic Bread, INR 79, qty 1
- Bill summary:
  - Subtotal INR 672
  - Delivery fee INR 20
  - Total INR 692
- Info strip:
  - `Cart locks in 28:45`, timer in `--urgent`
  - `Expected delivery: 9:45 PM`
- Sticky CTA: `Checkout ->`
- Bottom nav with Cart active and badge `3`.

Rules:

- Use `--urgent` for lock timer and expected delivery only.
- Bill total should be visually dominant.

### Screen 9: Switch Restaurant Prompt

Purpose: prevent accidental cross-restaurant cart replacement.

Content:

- Background is restaurant menu screen, darkened and blurred.
- Bottom sheet:
  - Drag handle
  - Cart icon
  - Heading: `Switch restaurants?`
  - Body: `You've got items from The Rising Cafe in your cart. Wanna clear it to add from Flavor Town?`
  - Primary: `Clear cart & switch`
  - Secondary: `Nope, keep my cart`

Rules:

- Modal blocks interaction with background.
- Primary is magenta filled.
- Secondary is outlined or muted.

### Screen 10: Checkout

Purpose: focused checkout flow.

Content:

- Header: back, `Almost there`
- Drop point card:
  - Label: `Where should we drop it?`
  - Input placeholder: `Hostel Block A, Room 204`
  - Helper: `Be specific - helps riders find you`
- Order summary:
  - Restaurant: `The Rising Cafe`
  - Items: `Paneer Pizza x1 - Chicken Biryani x2 - Garlic Bread x1`
  - Subtotal INR 672
  - Delivery fee INR 20
  - Total INR 692
- Batch info:
  - `Locks in 12:34`, countdown in `--urgent`
  - `Drops by 9:45 PM`
- Sticky CTA: `Pay INR 692 ->`

Rules:

- No bottom nav.
- Keep checkout focused and compact.

### Screen 11: Payment Loading

Purpose: payment in-progress state.

Content:

- Center spinner in magenta with a small lime accent arc.
- Heading: `Cooking up your payment...`
- Subtext: `Hang tight, don't close this screen`
- Bottom text with lock icon: `Secure payment`

Rules:

- No buttons.
- No bottom nav.
- Minimal full-screen state.

### Screen 12: Order Confirmation

Purpose: payment success and next action.

Content:

- Large green success check in circular badge.
- Subtle magenta and lime confetti dots.
- Heading: `You're in!`
- Subtext: `Order #GC-20247 - The Rising Cafe`
- Card:
  - Label: `Drops by`
  - Time: `9:45 PM` in `--urgent`
  - Text: `We'll ping you when it's out for delivery`
- Buttons:
  - Primary: `Track my order ->`
  - Secondary: `Back to browse`

Rules:

- No bottom nav.
- Success should feel celebratory but still dark and clean.

### Screen 13: Order Tracking

Purpose: show order status, payment status, and item-level status.

Content:

- Header: back, `Order #GC-20247`, `Help` link in magenta.
- Status card:
  - Pill: `Being prepared`, lime background, dark text.
  - Progress tracker:
    - Confirmed, done, green, timestamp 9:12 PM
    - Preparing, active, timestamp 9:20 PM
    - On the way, inactive
    - Delivered, inactive
  - `Est. delivery 9:45 PM` in `--urgent`
- Payment card:
  - `Payment: Paid`, green check.
- Item status card:
  - Paneer Pizza x1, Confirmed
  - Chicken Biryani x2, Confirmed
  - Garlic Bread x1, Unavailable - Refunded
  - Subtext: `INR 79 refunded to source`
- Bottom link: `Need help with this order?`

Rules:

- No bottom nav.
- Red is only for unavailable/refunded status.
- Display copy must be derived from the backend `order_status` enum using the mapping table below. Do not hardcode friendly display labels as backend field names.

Backend status mapping:

| Backend `order_status` | Friendly label | Tracker step | Visual state |
| --- | --- | --- | --- |
| `placed` | `Confirmed` | Confirmed | Done, green |
| `locked` | `Confirmed` | Confirmed | Done, green |
| `procuring` | `Preparing` | Preparing | Active, lime |
| `out_for_delivery` | `On the way` | On the way | Active, lime |
| `delivered` | `Delivered` | Delivered | Done, green |
| `cancelled` | `Cancelled` | None | Danger/error state |
| `refunded` | `Refunded` | None | Danger or neutral refund state |

Tracker behavior:

- `placed` and `locked` should both mark Confirmed complete.
- `procuring` should mark Confirmed complete and Preparing active.
- `out_for_delivery` should mark Confirmed and Preparing complete, then On the way active.
- `delivered` should mark all four tracker steps complete.
- `cancelled` and `refunded` should replace the normal tracker with an error/refund status card.

### Screen 14: Empty States

Purpose: compact empty-state design references.

Content in one phone frame:

- Top: Empty Cart
  - Icon: cart, low-opacity magenta
  - Heading: `Cart's feeling lonely`
  - Subtext: `Add something delicious to get started`
  - Button: `Browse restaurants ->`
- Middle: No Search Results
  - Icon: search, low opacity
  - Heading: `Nothing matches that`
  - Subtext: `Try a different dish or restaurant name`
- Bottom: No Past Orders
  - Icon: clipboard, low opacity
  - Heading: `No orders yet`
  - Subtext: `Your first order is one tap away`
  - Button: `Order now ->`

Rules:

- Separate sections with dashed dividers and small caption labels.
- All three states must fit inside one phone frame.

### Screen 15: Error States

Purpose: compact error-state design references.

Content in one phone frame:

- Top: Payment Failed
  - Red warning icon in circle.
  - Heading: `Payment didn't go through`
  - Subtext: `No money was taken. Give it another shot?`
  - Primary: `Try again`
  - Secondary link: `Use a different method`
- Bottom: Cutoff Passed
  - Lime clock icon in circle.
  - Heading: `Batch just closed`
  - Subtext: `Cutoff hit while you were checking out. Next batch opens at 7:00 PM.`
  - Primary: `Set a reminder`
  - Secondary: `Back to browse`

Rules:

- Separate states with a dashed divider and labels.
- Cutoff passed is urgent/expected, not a danger state.

## Showcase Pages

If implementing mockup showcase pages in the frontend, create three 16:9 landscape compositions:

- Auth and campus: screens 1-5.
- Browse and checkout: screens 6-10.
- Payment and status: screens 11-15.

Showcase-only requirements:

- Dark studio background `#0D0D0F`.
- Five iPhone 15 Pro-style frames side by side.
- Handwritten labels above each phone.
- Bottom palette strip with:
  - `#FF2E63`
  - `#D4FF4F`
  - `#00E28A`
  - `#FF4747`
  - `#1A1A1E`
- Caption: `Fonts: Space Grotesk + General Sans`

Do not include the palette strip or handwritten annotations in normal app routes.

## Interaction States

Countdown color behavior:

- Plenty of time: `--urgent`.
- Warning threshold: blend toward `--brand`.
- Expired/cutoff: show a cutoff state, disable checkout, and guide the user to the next batch.

OTP:

- Empty boxes: neutral border.
- Focused box: magenta border/cursor.
- Invalid boxes: red border and subtle red glow.
- Verify button disabled until enough digits are entered.
- OTP request rate limit: backend allows 3 OTP requests per phone per 10 minutes. When exceeded, show the Phone Entry rate-limit state, disable resend/send actions, and display a live `Try again in mm:ss` countdown from the API retry time if provided.

Cart:

- Cart badge appears on bottom nav when item count > 0.
- If adding from a different restaurant, show the switch restaurant bottom sheet.
- Cart locks when countdown reaches zero.

Payment:

- Loading state should not allow navigation.
- Confirmation leads to tracking.
- Payment failure should clearly say no money was taken.

## Accessibility and Responsiveness

- Maintain a minimum 4.5:1 contrast for body text where possible.
- All tappable controls should be at least 44px tall/wide.
- Use semantic buttons and inputs.
- Do not rely on color alone for status; pair color with icons/text.
- Support keyboard input for phone, OTP, campus search, and checkout address.
- Respect safe-area insets on mobile devices.
- Avoid horizontal scrolling in the production app except for offer cards.

## Data Model Hints

Use local mock data while building the frontend, then connect to the existing backend APIs.

Suggested mock entities:

- Campus: id, name, city, state, selected.
- Restaurant: id, name, cuisine, rating, distanceKm, etaMinutes, tags, imageUrl.
- MenuItem: id, restaurantId, name, description, price, isVeg, imageUrl.
- CartItem: menuItemId, restaurantId, quantity, unitPrice.
- Order: id, restaurantName, items, total, status, paymentStatus, eta.

Keep INR formatting consistent. Prefer a helper such as `formatINR(amount)` so the app can switch between `INR 692` and `₹692` based on font/rendering reliability.

## Implementation Notes for Codex

- Build the actual app screens first, not a marketing landing page.
- Use reusable components rather than duplicating card/button/input styles.
- Keep routes simple:
  - `/splash`
  - `/auth/phone`
  - `/auth/otp`
  - `/campus`
  - `/home`
  - `/restaurants/:id`
  - `/cart`
  - `/checkout`
  - `/payment/loading`
  - `/orders/:id/confirmed`
  - `/orders/:id/tracking`
  - `/states/empty`
  - `/states/errors`
  - Optional showcase routes: `/showcase/auth`, `/showcase/order`, `/showcase/status`
- If a framework is not yet chosen, prefer a Vite + React + TypeScript frontend for speed and component clarity.
- If adding Tailwind, map all design tokens into `tailwind.config`.
- If using CSS modules or plain CSS, define tokens once and consume them everywhere.
- Verify screens at mobile widths around 390px and 430px.
- Before finishing implementation, visually inspect all screens for text overflow, button wrapping, and sticky bottom overlap.
