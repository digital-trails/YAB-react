/**
 * Make a mouse behave like a finger inside the simulated phone.
 *
 * The web build exists to show stakeholders how the app looks and feels on a
 * phone. The screens use plain React Native scroll views, which the browser
 * scrolls on touch and wheel but not on a mouse drag, so a horizontal row or
 * a paging carousel is stuck for anyone with a mouse. Rather than give each
 * screen a web-specific scroll view, the phone frame installs this once: a
 * mouse drag anywhere inside the screen is turned into a swipe.
 *
 * What a swipe does, mirroring the native scroll view:
 * - locks to the dominant axis after a small slop and scrolls the nearest
 *   ancestor that can still move that way, so a sideways drag moves the row
 *   and an up/down drag moves the page;
 * - keeps coasting after release with UIScrollView's normal deceleration;
 * - on a paging scroll view, settles onto a page: a flick turns the page, a
 *   slow release snaps to the nearest one;
 * - swallows the click that the browser would otherwise fire on whatever the
 *   pointer ended up over, so a swipe never doubles as a tap. React Native
 *   Web already drops the pressed state when an ancestor scrolls.
 *
 * Everything else is left to the browser: touch and pen input, wheel and
 * keyboard scrolling, text fields, and elements that opt out of panning via
 * `touch-action` (gesture handlers set `touch-action: none`).
 */

type Axis = 'x' | 'y';

/** A paging scroll view whose CSS snapping is switched off while we move it. */
type Paging = { el: HTMLElement; axis: Axis; snap: string };

/** Movement before a press becomes a swipe, in px. */
const SLOP = 5;
/** UIScrollViewDecelerationRateNormal, applied per millisecond. */
const DECELERATION = 0.998;
/** Below this the coast is over, in px/ms. */
const REST_VELOCITY = 0.02;
/** Release speed that turns a page instead of snapping back, in px/ms. */
const PAGE_FLICK_VELOCITY = 0.3;
/** How long a page takes to settle after release, in ms. */
const PAGE_SETTLE_MS = 320;
/** Window after a swipe in which a click is treated as its tail end, in ms. */
const CLICK_SUPPRESS_MS = 100;

export function installMouseAsTouch(root: HTMLElement): () => void {
  let pointerId = -1;
  let pressTarget: Element | null = null;
  let startX = 0;
  let startY = 0;
  let lastPos = 0;
  let lastTime = 0;
  let velocity = 0;
  let axis: Axis | null = null;
  let scroller: HTMLElement | null = null;
  let startScroll = 0;
  let paging: Paging | null = null;
  let suppressClick = false;
  let suppressTimer = 0;
  let frame = 0;

  const stopAnimation = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    // A finger landing on a moving scroll view stops it where it is.
    stopAnimation();
    pointerId = event.pointerId;
    pressTarget = event.target instanceof Element ? event.target : null;
    startX = event.clientX;
    startY = event.clientY;
    axis = null;
    scroller = null;
    velocity = 0;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (!axis) {
      if (Math.hypot(dx, dy) < SLOP) return;
      const nextAxis: Axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      const target = pressTarget && !isEditable(pressTarget) ? pressTarget : null;
      const found = target ? findScroller(target, root, nextAxis, nextAxis === 'x' ? dx : dy) : null;
      if (!target || !found || !allowsPan(target, found, nextAxis)) {
        // Not a swipe we handle; let the gesture finish on its own.
        pressTarget = null;
        return;
      }
      axis = nextAxis;
      scroller = found;
      startScroll = position(found, nextAxis);
      if (paging && paging.el !== found) finishPaging();
      if (!paging) {
        const snap = getComputedStyle(found).scrollSnapType || 'none';
        if (snap !== 'none') {
          found.style.scrollSnapType = 'none';
          paging = { el: found, axis: nextAxis, snap };
        }
      }
      root.setPointerCapture(event.pointerId);
      root.style.userSelect = 'none';
      lastPos = nextAxis === 'x' ? event.clientX : event.clientY;
      lastTime = event.timeStamp;
      return;
    }

    if (!scroller) return;
    const pointer = axis === 'x' ? event.clientX : event.clientY;
    const delta = axis === 'x' ? dx : dy;
    // Content follows the finger, so the scroll offset moves against the pointer.
    setPosition(scroller, axis, startScroll - delta);
    const dt = event.timeStamp - lastTime;
    if (dt > 0) {
      const instant = (pointer - lastPos) / dt;
      velocity = velocity * 0.2 + instant * 0.8;
    }
    lastPos = pointer;
    lastTime = event.timeStamp;
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    pointerId = -1;
    if (!axis || !scroller) {
      // A tap (or an unhandled drag) that interrupted a settling page: finish settling.
      if (paging && !frame) settleOnPage(paging.el, paging.axis, 0, position(paging.el, paging.axis));
      return;
    }
    if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
    root.style.userSelect = '';
    // A finger that paused before lifting leaves no momentum.
    if (event.timeStamp - lastTime > 100) velocity = 0;
    suppressClick = true;
    window.clearTimeout(suppressTimer);
    suppressTimer = window.setTimeout(() => {
      suppressClick = false;
    }, CLICK_SUPPRESS_MS);

    const el = scroller;
    const a = axis;
    axis = null;
    scroller = null;
    if (paging && paging.el === el) settleOnPage(el, a, velocity, startScroll);
    else coast(el, a, velocity);
  };

  const coast = (el: HTMLElement, a: Axis, initial: number) => {
    let speed = initial;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      const limit = maxPosition(el, a);
      const next = position(el, a) - speed * dt;
      const clamped = Math.max(0, Math.min(limit, next));
      setPosition(el, a, clamped);
      speed *= Math.pow(DECELERATION, dt);
      frame = Math.abs(speed) > REST_VELOCITY && clamped === next ? requestAnimationFrame(step) : 0;
    };
    if (Math.abs(speed) > REST_VELOCITY) frame = requestAnimationFrame(step);
  };

  /** Ease onto a page, then hand snapping back to the browser at a position it agrees with. */
  const settleOnPage = (el: HTMLElement, a: Axis, speed: number, from: number) => {
    const stops = pageStops(el, a);
    const current = position(el, a);
    const nearest = (value: number) =>
      stops.reduce((best, stop) => (Math.abs(stop - value) < Math.abs(best - value) ? stop : best), stops[0] ?? 0);
    let target = nearest(current);
    if (Math.abs(speed) >= PAGE_FLICK_VELOCITY) {
      const index = stops.indexOf(nearest(from));
      // Flicking the content leftwards (negative speed) reveals the next page.
      target = stops[Math.max(0, Math.min(stops.length - 1, index + (speed < 0 ? 1 : -1)))] ?? target;
    }
    if (Math.abs(target - current) < 1) {
      setPosition(el, a, target);
      finishPaging();
      return;
    }
    const began = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - began) / PAGE_SETTLE_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setPosition(el, a, current + (target - current) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        finishPaging();
      }
    };
    frame = requestAnimationFrame(step);
  };

  const finishPaging = () => {
    if (!paging) return;
    paging.el.style.scrollSnapType = '';
    paging = null;
  };

  const onClick = (event: MouseEvent) => {
    if (!suppressClick) return;
    event.stopPropagation();
    event.preventDefault();
  };

  const onDragStart = (event: DragEvent) => event.preventDefault();

  root.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerEnd);
  window.addEventListener('pointercancel', onPointerEnd);
  root.addEventListener('click', onClick, true);
  root.addEventListener('dragstart', onDragStart);

  return () => {
    stopAnimation();
    finishPaging();
    window.clearTimeout(suppressTimer);
    root.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerEnd);
    window.removeEventListener('pointercancel', onPointerEnd);
    root.removeEventListener('click', onClick, true);
    root.removeEventListener('dragstart', onDragStart);
  };
}

function position(el: HTMLElement, axis: Axis): number {
  return axis === 'x' ? el.scrollLeft : el.scrollTop;
}

function maxPosition(el: HTMLElement, axis: Axis): number {
  return axis === 'x' ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
}

function setPosition(el: HTMLElement, axis: Axis, value: number): void {
  if (axis === 'x') el.scrollLeft = value;
  else el.scrollTop = value;
}

/** Nearest ancestor, up to and including root, that scrolls on `axis` and still has room in the drag direction. */
function findScroller(target: Element, root: HTMLElement, axis: Axis, delta: number): HTMLElement | null {
  for (let el: Element | null = target; el; el = el === root ? null : el.parentElement) {
    if (!(el instanceof HTMLElement)) continue;
    const style = getComputedStyle(el);
    const overflow = axis === 'x' ? style.overflowX : style.overflowY;
    if (overflow !== 'auto' && overflow !== 'scroll') continue;
    const limit = maxPosition(el, axis);
    if (limit <= 1) continue;
    const current = position(el, axis);
    // Dragging the content right/down pulls the offset toward zero.
    if (delta > 0 ? current > 0 : current < limit) return el;
  }
  return null;
}

/** Honour `touch-action` between the press target and the scroller, as the browser does for a real finger. */
function allowsPan(target: Element, scroller: HTMLElement, axis: Axis): boolean {
  for (let el: Element | null = target; el && el !== scroller; el = el.parentElement) {
    const action = getComputedStyle(el).touchAction;
    if (action === 'none') return false;
    if (/\bpan-/.test(action) && !action.includes(axis === 'x' ? 'pan-x' : 'pan-y')) return false;
  }
  return true;
}

function isEditable(target: Element): boolean {
  return target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null;
}

/** Page offsets of a paging scroll view. React Native pages by the viewport size, so do the same. */
function pageStops(el: HTMLElement, axis: Axis): number[] {
  const size = axis === 'x' ? el.clientWidth : el.clientHeight;
  const limit = maxPosition(el, axis);
  if (size <= 0) return [0];
  const stops = new Set<number>();
  for (let offset = 0; offset < limit + size / 2; offset += size) stops.add(Math.min(Math.round(offset), limit));
  return [...stops].sort((a, b) => a - b);
}
