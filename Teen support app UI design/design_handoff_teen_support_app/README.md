# Handoff: Teen Social-Comparison Support App

## Overview
A mobile app that helps teenagers cope with negative social comparison (the "comparing yourself to others online" spiral). Two kinds of support: **in-the-moment interventions** (short exercises for an active spiral) and **skills training** (longer modules that build coping skills over time). Three screens: Home, Library, and a combined Progress/Settings screen ("You").

## About the Design Files
The bundled file (Mental Health App.dc.html) is a **design reference built in HTML** — a clickable prototype showing intended look, content, and interaction, not production code to lift as-is. The task is to **recreate this design in the target codebase's environment** (React Native, SwiftUI, Kotlin/Compose, Flutter, etc.) using that environment's own component and navigation patterns. If no mobile codebase exists yet, choose the framework best suited to the project (React Native is a reasonable default for cross-platform) and implement fresh there.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and copy are final for this round — recreate pixel-close using the values below. Iconography is currently simple inline line icons (see Assets) and can be swapped for the team's icon library as long as line-weight and roundness are preserved.

## Screens / Views

### 1. Home
**Purpose:** Daily entry point — quick mood check-in, one-tap access to an in-the-moment reset, resumes an in-progress module, shows weekly stats, and surfaces recommended content.

**Layout:** Single scrolling column, 20px side padding, 22px gap between sections, inside a phone frame (390x844 reference viewport, but layout should be responsive to device width).

**Components (top to bottom):**
1. **Greeting** — "Good afternoon, {name}" in heading font, 26px; date line below in 13px muted text.
2. **Mood check-in card** — surface card, 28px radius, warm peach tint background (accent color mixed 14% into the base surface). Kicker label "EVERY DAY" (11px, bold, uppercase, accent-700). Question text (14px, semibold). Row of 3 pill buttons: Okay / Anxious / Overwhelmed — selected pill fills solid accent with light text; unselected are a light neutral fill with a hairline border. Selecting a mood reveals a short contextual note (12.5px, muted) below the pills.
3. **Primary CTA card ("Need support right now?")** — solid sage/accent-2-700 background, 28px radius, decorative soft circle shapes bleeding off two corners (low-opacity light circles), heading-font title (19px, on-bg light color), one line of supporting copy, and a pill button "Begin - 3 min" in a light secondary style.
4. **Continue your practice** — section label (12px uppercase, muted) + one card: circular icon avatar (44px, sage-tinted), module title, thin progress bar (6px, rounded, filled portion in accent-2), and a ghost "Resume" button.
5. **This week stats row** — 3 equal-width cards (day streak / sessions / minutes practiced), each with a big heading-font number and small caption, and a very subtle dot-texture background (radial-gradient dots at ~1.5px, tinted per-card in accent / accent-2 / neutral).
6. **Recommended for you** — horizontally scrolling row of cards (150px wide), each with a colored tag ("In the moment" / "Skills"), title, duration, and a rotating tinted background (accent-100 / accent-2-100 / neutral-200) so the row reads with variety, not one flat color.
7. **Need help now banner** — full-width outlined card, accent-tinted background and border, small solid accent dot, bold heading text + one line of muted body text. Static entry point to crisis resources.

### 2. Library
**Purpose:** Browse all intervention and skills content, filterable.

**Layout:** Same column shell. Header ("Library" + subtitle). A segmented control (All / In the moment / Skills training) filters two stacked sections below.

**Components:**
- **In the moment section** — section title + a "quick support" tag. List of row-cards, each: circular icon-avatar with a letter/initial (colors rotate per item: accent, accent-2, neutral), title (13.5px semibold), meta line (11px muted, "{duration} - {technique}"), and a chevron on the right. Cards must be laid out as a horizontal row (icon left, text middle, chevron right) — watch for the design system's card class own column default; explicitly set the row's flex-direction to row.
- **Skills training section** — section title + "build over time" tag. Each card: icon avatar + title/meta row, then a thin rounded progress bar underneath showing module completion (0-100%). Sample content: "Understanding social comparison" (25%), "Building self-compassion" (0%), "Setting boundaries online" (0%).

### 3. You (Progress + Settings)
**Purpose:** Shows the teen's practice history/achievements and lets them adjust reminders, notifications, and privacy-related sharing.

**Components:**
- Header ("Your progress" + subtitle).
- 3 stat cards (day streak / sessions / total time), same dot-texture treatment as Home.
- Weekly activity bar chart — 7 bars (Mon-Sun), one highlighted in solid accent (the current/peak day), rest in neutral; card has a soft decorative circle in one corner.
- Badges row — small pill tags in varied colors (accent / accent-2 / neutral) e.g. "7-day streak", "First module complete", "Early bird".
- Settings list card — rows: Daily reminder (with time subtext + toggle), Push notifications (toggle), Share progress with a trusted adult (toggle — a guardian-visibility feature specific to a teen mental-health app), Privacy & data (chevron, navigates out), Help & crisis resources (chevron, navigates out). Toggles are pill switches: track fills solid accent when on, neutral when off; 20px knob slides between 2px and 20px inset.

### Tab bar (all screens)
Fixed bottom bar, 3 items: Home (house icon), Library (open-book icon), You (rounded-person icon). Active tab: icon + label tinted accent-700 on an accent-100 pill background; inactive: neutral-600, transparent background. Icons are simple line icons, stroke-width ~2.75 (rounder, heavier stroke, per design system spec).

## Interactions & Behavior
- Tapping a tab switches the visible screen (simple state switch, no animation specified — a standard tab-bar crossfade/slide is fine).
- Tapping a mood pill selects it (single-select) and reveals/updates the contextual note text.
- Library segmented control filters which of the two sections show (All shows both; each other option isolates its section).
- Settings toggles are simple boolean switches, instantly applied (no confirm step), animate the knob position (~150ms).
- No modals, multi-step flows, or loading states are represented in this pass — those need definition before build if required.

## State Management
Minimal client state for this fidelity:
- activeTab: 'home' | 'library' | 'you'
- selectedMood: null | 'okay' | 'anxious' | 'overwhelmed'
- libraryFilter: 'all' | 'moment' | 'skills'
- settings: { dailyReminder: boolean, pushNotifications: boolean, shareWithTrustedAdult: boolean }
- Progress data (streak, session count, minutes practiced, weekly activity, module completion %, badges) — sample/static in this prototype; production needs a real data source (local store + backend sync, given the "share with trusted adult" feature implies account/guardian linkage).

## Design Tokens
**Colors**
- Background (page/base): #f5ead8
- Surface (cards): #ebddc5
- Text: #201e1d
- Accent (terracotta): #c67139 — ramp includes #fff2eb (100) -> #ffe1d0 (200) -> #ffc6a5 (300) -> #f6a06b (400) ... darker steps (700/800/900) used for text-on-tint.
- Accent-2 (sage): #7a8a5e — same 100-900 ramp structure, darkest step #272e1b.
- Divider: text color at 16% opacity.

**Typography**
- Heading font: Caprasimo (weight 400) — used for all numeric stats, screen titles, card titles.
- Body font: Figtree — regular 400, semibold 600, bold 700.
- Scale used: 26px (screen title), 19-20px (card headline / stat numbers), 14-14.5px (body/semibold labels), 12.5-13px (secondary text), 11-11.5px (meta/caption), 10-10.5px (micro labels), all with letter-spacing 0.06-0.1em + uppercase for kicker/section labels.

**Radii**
- Small: 8px, Medium: 16px (buttons/inputs), Large: 28px (cards, hero containers), Pills/toggles/avatars: 999px (full round).

**Shadows**
- sm: 0 1px 2px rgba(46,43,37,.14)
- md: 0 3px 10px rgba(46,43,37,.16)
- lg: 0 12px 32px rgba(46,43,37,.22)

**Spacing**
- Base unit ~4.4px scale (space-1...space-8, up to 35px); section gaps in this design use 20-22px, card internal padding ~16-20px, row gaps 8-14px.

## Assets
- No photographic assets used. Icons are hand-drawn inline SVGs (house, open book, rounded person) at stroke-width 2.75, no external icon library dependency — swap for the team's real icon set (Lucide-style recommended, matching stroke weight).
- Fonts: Caprasimo and Figtree, loaded from Google Fonts in the prototype — bundle these properly (static font files) in the production app rather than a runtime Google Fonts fetch, especially offline-first for a mental-health app.

## Files
- Mental Health App.dc.html — the full interactive prototype (all 3 screens, all interactions described above), included in this folder for reference.

## Important Notes for Implementation
- This is a **mental health product for teenagers** — treat the "Need help now" and "Help & crisis resources" entry points as functionally critical, not decorative; they should be implemented with real, always-available crisis resources (e.g., a crisis line integration), not placeholder links.
- "Share progress with a trusted adult" implies a guardian/parent account-linking and consent flow that is NOT designed in this pass — flag this as an open question before building the toggle for real.
- Content shown (module names, durations, stats) is illustrative sample content, not final copy — confirm final therapeutic copy with a clinical/content reviewer before shipping.
