# Athletistry app: design principles

Ranked. When two collide, the higher one wins. Every screen is reviewed against this list.

## 1. The next rep is the loudest thing on screen
**Statement:** Each screen has one primary action, and it is the most visible thing on it.
**Why:** Dancers open the app between classes with a minute to spare. If they have to choose, they close it.
**Do:** Today shows one dark card with one white "Start session" button.
**Don't:** Two gradient buttons, three chips and a glowing progress bar fighting for the same glance.
**Trade-off:** Secondary tools sit one tap deeper.

## 2. Answer the press, not the release
**Statement:** Every tappable thing changes the moment a finger lands on it.
**Why:** Lag between touch and response is what makes a web app feel like a website.
**Do:** Buttons scale to .97 on `:active` in 80ms; rows tint; tabs dip.
**Don't:** Hover lifts (`translateY(-2px)`) that never fire on a phone.
**Trade-off:** Less desktop "hover theatre".

## 3. Readable mid-class, from a metre away
**Statement:** Nothing renders below 11px. Body copy is 15 to 17px. Numbers use tabular figures.
**Why:** The phone is propped on a barre or the floor, not held at reading distance. The old app had 170 labels at 8 to 10px.
**Do:** Use the type tokens: `text-2xs` (11), `xs` (12), `footnote` (13), `subhead` (15), `body` (17), `title3/2/1`, `large`.
**Don't:** `text-[9px] uppercase tracking-[.2em]`.
**Trade-off:** Dense screens get longer and scroll.

## 4. One way to do each thing
**Statement:** One accent colour, one dark surface, one button shape, five radii (6, 8, 12, 16, 20).
**Why:** Consistency is the cheapest signal that the product is reliable (aesthetic-usability effect).
**Do:** `bg-teal`, `rounded-xl` for controls, `rounded-3xl` for cards.
**Don't:** `rounded-[22px]`, `text-[#0d72d8]`, a third gradient.
**Trade-off:** Fewer one-off flourishes per screen.

## 5. Quiet chrome, loud content
**Statement:** Navigation and surfaces recede; the dancer's work and numbers stand forward.
**Why:** Three stacked redesigns had left marble backgrounds, steel-gradient headlines and blur on every card.
**Do:** Flat #f5f5f7 ground, solid white cards, hairlines. Blur only on the top bar and tab bar, which content scrolls under.
**Don't:** Gradient text (fails contrast), glow shadows, translucent cards on translucent cards.
**Trade-off:** Less "premium" at first glance in screenshots; more legible in use.

## 6. Motion only when it explains something
**Statement:** Motion confirms an input or shows where something came from. Entrances are a short fade.
**Why:** Staggered parades on every route slow people down the tenth time.
**Do:** Respect `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`.
**Don't:** Animations that run on every visit and can't be interrupted.

## Navigation
Phones get five tabs (Today, Train, Calendar, Progress, Profile). Learn lives in Profile and in the menu and search. Desktop sidebar keeps all six.

## Type
System font (SF on Apple devices). Sentence case headings, weight and size carry hierarchy, tracking tightens as size grows. Same language as the Playbook sales page and PDF.
