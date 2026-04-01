import { z as head, F as ensure_array_like, G as attr_class } from "../../chunks/index.js";
import { l as escape_html } from "../../chunks/context.js";
const identityTransform = () => ({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0
});
class FrameLoop {
  constructor(callback) {
    this.callback = callback;
  }
  frame = 0;
  queued = false;
  request() {
    if (this.queued) {
      return;
    }
    this.queued = true;
    this.frame = requestAnimationFrame(() => {
      this.queued = false;
      this.callback();
    });
  }
  cancel() {
    if (this.frame !== 0) {
      cancelAnimationFrame(this.frame);
    }
    this.frame = 0;
    this.queued = false;
  }
}
function rectFromDomRect(domRect) {
  return {
    x: domRect.x,
    y: domRect.y,
    width: domRect.width,
    height: domRect.height
  };
}
function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}
class MeasurementCache {
  rects = /* @__PURE__ */ new Map();
  measure(id, element) {
    const rect = rectFromDomRect(element.getBoundingClientRect());
    this.rects.set(id, rect);
    return rect;
  }
  get(id) {
    return this.rects.get(id);
  }
  invalidate(id) {
    if (id) {
      this.rects.delete(id);
      return;
    }
    this.rects.clear();
  }
}
function maybeSnap(value, pixelSnap) {
  return pixelSnap ? Math.round(value) : value;
}
function clampScale(value) {
  return Math.max(0.01, value);
}
function updateTransformSession(options, pointerCurrent) {
  const deltaX = pointerCurrent.x - options.pointerStart.x;
  const deltaY = pointerCurrent.y - options.pointerStart.y;
  if (options.kind === "drag") {
    return {
      ...options.transformStart,
      x: maybeSnap(options.transformStart.x + deltaX, options.pixelSnap ?? false),
      y: maybeSnap(options.transformStart.y + deltaY, options.pixelSnap ?? false)
    };
  }
  if (options.kind === "resize") {
    const next = { ...options.transformStart };
    const handle = options.handle ?? "se";
    const pixelSnap = options.pixelSnap ?? false;
    if (options.lockAspectRatio) {
      const candidateScaleX = handle.includes("e") ? options.transformStart.scaleX + deltaX / 100 : handle.includes("w") ? options.transformStart.scaleX - deltaX / 100 : options.transformStart.scaleX;
      const candidateScaleY = handle.includes("s") ? options.transformStart.scaleY + deltaY / 100 : handle.includes("n") ? options.transformStart.scaleY - deltaY / 100 : options.transformStart.scaleY;
      const factorFromX = options.transformStart.scaleX === 0 ? 1 : clampScale(candidateScaleX) / options.transformStart.scaleX;
      const factorFromY = options.transformStart.scaleY === 0 ? 1 : clampScale(candidateScaleY) / options.transformStart.scaleY;
      const useX = (handle.includes("e") || handle.includes("w")) && (!handle.includes("n") && !handle.includes("s") || Math.abs(deltaX) >= Math.abs(deltaY));
      const factor = useX || !handle.includes("n") && !handle.includes("s") ? factorFromX : factorFromY;
      next.scaleX = clampScale(options.transformStart.scaleX * factor);
      next.scaleY = clampScale(options.transformStart.scaleY * factor);
      if (handle.includes("w")) {
        next.x = maybeSnap(options.transformStart.x + deltaX, pixelSnap);
      }
      if (handle.includes("n")) {
        next.y = maybeSnap(options.transformStart.y + deltaY, pixelSnap);
      }
      return next;
    }
    if (handle.includes("e")) {
      next.scaleX = clampScale(options.transformStart.scaleX + deltaX / 100);
    }
    if (handle.includes("w")) {
      next.scaleX = clampScale(options.transformStart.scaleX - deltaX / 100);
      next.x = maybeSnap(options.transformStart.x + deltaX, pixelSnap);
    }
    if (handle.includes("s")) {
      next.scaleY = clampScale(options.transformStart.scaleY + deltaY / 100);
    }
    if (handle.includes("n")) {
      next.scaleY = clampScale(options.transformStart.scaleY - deltaY / 100);
      next.y = maybeSnap(options.transformStart.y + deltaY, pixelSnap);
    }
    return next;
  }
  return options.transformStart;
}
function createEditorEngine(options = {}) {
  const draggables = /* @__PURE__ */ new Map();
  const droppables = /* @__PURE__ */ new Map();
  const measurements = new MeasurementCache();
  const listeners = /* @__PURE__ */ new Set();
  let active = null;
  let pendingPointer = null;
  let hoveredDroppableId = null;
  function snapshot() {
    return {
      active,
      draggableCount: draggables.size,
      droppableCount: droppables.size,
      hoveredDroppableId
    };
  }
  function publish() {
    const next = snapshot();
    for (const listener of listeners) {
      listener(next);
    }
  }
  function updateHoveredDroppable(pointer) {
    hoveredDroppableId = null;
    for (const [id, registration] of droppables) {
      const rect = measurements.get(id) ?? measurements.measure(id, registration.element);
      if (pointInRect(pointer, rect)) {
        hoveredDroppableId = id;
      }
    }
  }
  const frameLoop = new FrameLoop(() => {
    if (!active || !pendingPointer) {
      return;
    }
    active = {
      ...active,
      pointerCurrent: pendingPointer,
      transformCurrent: updateTransformSession(
        {
          kind: active.kind,
          pointerStart: active.pointerStart,
          transformStart: active.transformStart,
          handle: active.handle,
          pixelSnap: options.pixelSnap ?? false,
          lockAspectRatio: active.lockAspectRatio ?? false
        },
        pendingPointer
      )
    };
    updateHoveredDroppable(pendingPointer);
    pendingPointer = null;
    publish();
  });
  function registerDraggable(registration) {
    draggables.set(registration.id, registration);
    publish();
    return () => {
      draggables.delete(registration.id);
      measurements.invalidate(registration.id);
      publish();
    };
  }
  function registerDroppable(registration) {
    droppables.set(registration.id, registration);
    publish();
    return () => {
      droppables.delete(registration.id);
      measurements.invalidate(registration.id);
      publish();
    };
  }
  function snapshotMeasurements() {
    for (const [id, registration] of draggables) {
      measurements.measure(id, registration.element);
    }
    for (const [id, registration] of droppables) {
      measurements.measure(id, registration.element);
    }
  }
  return {
    registerDraggable,
    registerDroppable,
    snapshotMeasurements,
    beginInteraction(input) {
      measurements.invalidate();
      snapshotMeasurements();
      active = {
        kind: input.kind,
        nodeId: input.nodeId,
        pointerStart: input.pointer,
        pointerCurrent: input.pointer,
        transformStart: input.transform,
        transformCurrent: input.transform,
        handle: input.handle,
        lockAspectRatio: input.lockAspectRatio
      };
      pendingPointer = input.pointer;
      updateHoveredDroppable(input.pointer);
      publish();
    },
    updatePointer(pointer) {
      if (!active) {
        return;
      }
      pendingPointer = pointer;
      frameLoop.request();
    },
    getSnapshot() {
      return snapshot();
    },
    getPreviewTransform() {
      return active?.transformCurrent ?? null;
    },
    commitInteraction() {
      if (!active) {
        return null;
      }
      const committed = {
        kind: active.kind,
        nodeId: active.nodeId,
        transform: active.transformCurrent,
        overId: hoveredDroppableId
      };
      active = null;
      pendingPointer = null;
      hoveredDroppableId = null;
      publish();
      return committed;
    },
    cancelInteraction() {
      active = null;
      pendingPointer = null;
      hoveredDroppableId = null;
      frameLoop.cancel();
      publish();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
function normalizeTransform(input) {
  return {
    ...identityTransform(),
    ...input
  };
}
function cloneTransforms(source) {
  return new Map(source);
}
function createEditorController(options = {}) {
  const engine = createEditorEngine(options);
  const listeners = /* @__PURE__ */ new Set();
  const transforms = /* @__PURE__ */ new Map();
  let engineSnapshot = engine.getSnapshot();
  function seedTransforms() {
    if (!options.initialTransforms) {
      return;
    }
    const entries = Symbol.iterator in Object(options.initialTransforms) ? Array.from(options.initialTransforms) : Object.entries(options.initialTransforms);
    for (const [id, transform] of entries) {
      transforms.set(id, normalizeTransform(transform));
    }
  }
  function buildSnapshot() {
    const previewTransforms = new Map(transforms);
    if (engineSnapshot.active) {
      previewTransforms.set(
        engineSnapshot.active.nodeId,
        normalizeTransform(engineSnapshot.active.transformCurrent)
      );
    }
    return {
      active: engineSnapshot.active,
      hoveredDroppableId: engineSnapshot.hoveredDroppableId,
      transforms: cloneTransforms(transforms),
      previewTransforms
    };
  }
  let currentSnapshot = buildSnapshot();
  function publish() {
    currentSnapshot = buildSnapshot();
    for (const listener of listeners) {
      listener(currentSnapshot);
    }
  }
  seedTransforms();
  currentSnapshot = buildSnapshot();
  const unsubscribeEngine = engine.subscribe((snapshot) => {
    engineSnapshot = snapshot;
    publish();
  });
  return {
    engine,
    registerTransform(id, transform) {
      if (!transforms.has(id)) {
        transforms.set(id, normalizeTransform(transform));
        publish();
      }
    },
    setTransform(id, transform) {
      transforms.set(id, normalizeTransform(transform));
      publish();
    },
    getTransform(id) {
      return normalizeTransform(transforms.get(id));
    },
    getLiveTransform(id) {
      if (engineSnapshot.active?.nodeId === id) {
        return normalizeTransform(engineSnapshot.active.transformCurrent);
      }
      return normalizeTransform(transforms.get(id));
    },
    getSnapshot() {
      return currentSnapshot;
    },
    commitActive() {
      const active = engine.getSnapshot().active;
      if (active) {
        transforms.set(active.nodeId, normalizeTransform(active.transformCurrent));
      }
      const committed = engine.commitInteraction();
      publish();
      return committed;
    },
    cancelActive() {
      engine.cancelInteraction();
      publish();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(currentSnapshot);
      return () => {
        listeners.delete(listener);
      };
    },
    destroy() {
      unsubscribeEngine();
      listeners.clear();
    }
  };
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const controller = createEditorController({
      pixelSnap: true,
      initialTransforms: {
        photo: { x: 48, y: 52 },
        palette: { x: 300, y: 140, scaleX: 0.92, scaleY: 0.92 },
        badge: { x: 184, y: 258, scaleX: 0.78, scaleY: 0.78 }
      }
    });
    const cards = [
      {
        id: "photo",
        title: "Hero image",
        copy: "Large asset block meant to move first and render exactly after commit.",
        className: "photo"
      },
      {
        id: "palette",
        title: "Palette strip",
        copy: "Secondary panel that can be nudged or resized without reflowing the whole stage.",
        className: "palette"
      },
      {
        id: "badge",
        title: "Badge",
        copy: "Small overlay element for fast layering and detail work.",
        className: "badge"
      }
    ];
    let snapshot = controller.getSnapshot();
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>svelte-dnd demo</title>`);
      });
    });
    $$renderer2.push(`<section class="page svelte-1uha8ag"><div class="intro svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">svelte-dnd</p> <h1 class="svelte-1uha8ag">Preview-first editor drag and resize</h1> <p class="svelte-1uha8ag">The library now has a real interaction loop: move and resize stay on the fast path, while
			expensive correctness can happen after commit.</p></div> <div class="layout svelte-1uha8ag"><div class="stage-shell svelte-1uha8ag"><div class="stage svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(cards);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let card = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`card ${card.className}`, "svelte-1uha8ag", { "active": snapshot.active?.nodeId === card.id })}><div class="card-copy svelte-1uha8ag"><h2 class="svelte-1uha8ag">${escape_html(card.title)}</h2> <p class="svelte-1uha8ag">${escape_html(card.copy)}</p></div> <div class="handles svelte-1uha8ag"><button class="handle nw svelte-1uha8ag" aria-label="Resize from top left"></button> <button class="handle ne svelte-1uha8ag" aria-label="Resize from top right"></button> <button class="handle se svelte-1uha8ag" aria-label="Resize from bottom right"></button> <button class="handle sw svelte-1uha8ag" aria-label="Resize from bottom left"></button></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <aside class="panel svelte-1uha8ag"><p class="eyebrow svelte-1uha8ag">Live State</p> <p class="svelte-1uha8ag"><strong class="svelte-1uha8ag">Active</strong>: ${escape_html(snapshot.active?.nodeId ?? "none")}</p> <p class="svelte-1uha8ag"><strong class="svelte-1uha8ag">Mode</strong>: ${escape_html(snapshot.active?.kind ?? "idle")}</p> <p class="svelte-1uha8ag"><strong class="svelte-1uha8ag">Over</strong>: ${escape_html(snapshot.hoveredDroppableId ?? "none")}</p> <ul class="svelte-1uha8ag"><!--[-->`);
    const each_array_1 = ensure_array_like(cards);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let card = each_array_1[$$index_1];
      $$renderer2.push(`<li class="svelte-1uha8ag"><strong class="svelte-1uha8ag">${escape_html(card.id)}</strong> <span class="svelte-1uha8ag">x ${escape_html(Math.round((snapshot.previewTransforms.get(card.id)?.x ?? 0) * 10) / 10)}, y
							${escape_html(Math.round((snapshot.previewTransforms.get(card.id)?.y ?? 0) * 10) / 10)}</span></li>`);
    }
    $$renderer2.push(`<!--]--></ul></aside></div></section>`);
  });
}
export {
  _page as default
};
