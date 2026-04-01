

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.iMoe2yR1.js","_app/immutable/chunks/DpGJeBF8.js","_app/immutable/chunks/DcpbNT_s.js","_app/immutable/chunks/5VQd14N9.js"];
export const stylesheets = [];
export const fonts = [];
