# Athletistry — Full Editorial Redesign

This redesign keeps the existing Next.js + Supabase product architecture and rebuilds the presentation layer around the new Athletistry visual direction.

## Redesigned product shell
- Graphite editorial desktop sidebar with Athletistry branding and account shortcut
- Compact mobile masthead, search sheet and floating black bottom navigation
- Mobile primary tabs: Dashboard, Programs, Workouts, Progress and Profile
- Pale stone / marble environment, graphite typography and restrained Athletistry blue
- Cormorant Garamond display typography paired with clean sans-serif UI text
- Unified panels, cards, buttons, tabs, form fields, page headers and responsive spacing
- Search index updated for Dashboard and the new Profile destination

## Primary screens rebuilt
- Dashboard / Today's Practice
- Programs
- Guided Workouts
- Workout Detail
- Warm-Ups
- Warm-Up Detail
- Ballet training
- Anatomy
- Explore
- Progress
- Achievements
- Profile (new route)
- Settings

The remaining specialist tools retain their existing product logic while inheriting the new global navigation, page architecture, typography, surfaces and controls.

## Progress data
The redesigned Progress experience uses existing Supabase training data rather than hard-coded mockup metrics. The new server helper derives activity trend, recent training, active days, average session duration, current phase context and achievement data from existing tables and program state.

## Backend safety
No Supabase migrations or schema changes are required for this redesign. Existing authentication, Stripe flows, program logic, workout logging and core data models are preserved. The only backend-facing addition is read-only aggregation used by the Progress interface.

## Verification performed in this environment
- All TypeScript / TSX files are syntax-transpiled as a validation pass.
- Local aliased and relative imports are checked for resolvable project targets.
- Git whitespace validation is run before packaging.
- CSS is parsed with PostCSS before packaging.

A full `next build` could not be executed in this workspace because its configured npm registry does not provide `@supabase/ssr`. On a normal development machine or Vercel, install dependencies from the public npm registry and run the standard build before production merge.

## Suggested deployment flow
Create a Git branch for the redesign, push these files, let Vercel create a Preview Deployment, test authenticated Supabase flows with real account data, then merge to production after visual QA.
