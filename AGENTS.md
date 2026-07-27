# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# This app

A mental-health app helping teenagers cope with negative social comparison. Three
tabs: Home, Library, You. The design handoff lives in
`Teen support app UI design/design_handoff_teen_support_app/`.

## Design system

- **Light-only.** The design specifies a single warm palette and no dark
  variants. The scaffold's light/dark theming has been removed — don't reintroduce
  `useColorScheme` or a `Colors.light`/`Colors.dark` split.
- **All colour, type, spacing and radii come from `src/constants/tokens.ts`.**
  Don't hardcode hex values or font sizes in screens.
- Token values come from the design-system stylesheet bundled inside
  `Mental Health App.dc.html`. That file is a self-contained bundle: the original
  document is JSON-embedded in its last `<script>` block, so grep the raw HTML
  for `--color-` rather than expecting a readable stylesheet.
- **The stylesheet's last rule block overrides earlier ones**
  (`.btn, .tag, .seg { border-radius: 999px }`, `.card { radius-lg * 1.15 }`).
  Read to the end before trusting a base class.
- **`.tag` uses 100-level backgrounds with 800-level text**, while icon avatars
  use 200-level on 700-level. Different pairings — don't collapse them.
- **`.btn` uses the *heading* font (Caprasimo) at 14px**, not the body font.
- **The design has no on-dark button variant.** It reuses `.btn-secondary` on
  the dark sage hero card, which measures 2.57:1 — below WCAG AA on the primary
  crisis CTA. `PillButton`'s `onDark` variant is a deliberate, documented
  deviation built from existing tokens. Any new button on a dark surface should
  use it; don't reach for `.btn-secondary` or `.btn-primary` there.
- **The design's "selected chip" (accent fill + `--color-bg` label) is 3.03:1.**
  It recurs on the mood pills and the segmented control. Use `SelectedFill` from
  tokens, which keeps the fill and darkens the label to 4.60:1.
- **The settings toggle's off-track is neutral-600, not the design's
  neutral-300** (1.11:1 against the card, 1.25:1 against the knob — the control
  and its state are both invisible). Same class of bug as the items above.
- **The weekly chart's inactive bars are neutral-500, not neutral-300**, and
  still only reach 2.15:1. This one is *not* fully fixed: pushing the bars to
  3:1 collapses them against today's accent bar and erases the highlight. It
  needs a design decision (a non-colour cue for "today"), so don't "fix" it by
  darkening the bars.
- **Check contrast before calling a screen done.** This palette is warm and
  mid-luminance, so accent-on-accent combinations fail more often than they
  look like they should. Measure, don't eyeball.
- **CSS flex items have `min-width: auto`; Yoga doesn't.** Where the design
  gives a row of text chips `flex: 1`, the browser floors each at its content
  width, so they render unequal. A literal `flex: 1` in React Native makes them
  equal columns and clips the longest label — use `flexGrow` alone.
- **Shadows go through `shadow(level)`,** never raw style props. React Native's
  `boxShadow` is New-Architecture Android only — not iOS, not web — so the helper
  branches per platform.
- The prototype uses CSS `color-mix()` and `radial-gradient()`, neither of which
  React Native has. Pre-computed equivalents live in `Mixed`; the dot texture is
  a real view grid (`DotTexture`).

## Conventions

- Screens read content through `ContentRepository` in `src/data/content.ts`, not
  from the sample constants directly, so a real backend can be swapped in later.
- The tab bar is custom (`expo-router/ui` headless tabs) because the design puts
  an accent pill behind both icon and label. **`TabTrigger` passes its own
  `style` — spread it *before* your own styles or it overrides your layout.**

## Product constraints

- **Crisis entry points ("Need help now", "Help & crisis resources") are
  functionally critical, not decorative.** They are currently inert by decision,
  pending real region-correct crisis numbers. Never ship them looking tappable
  while doing nothing — a teen tapping for help must not hit a dead end.
- "Share progress with a trusted adult" implies guardian account-linking and
  consent that is **not designed yet**. The toggle is UI-only.
- All module names, durations, stats and therapeutic copy are illustrative
  sample content, pending clinical review.

## Verifying UI

No mobile simulator on this machine. Check changes against the web target:
`npx expo start --web --port 8081`, then screenshot with headless Chrome.
