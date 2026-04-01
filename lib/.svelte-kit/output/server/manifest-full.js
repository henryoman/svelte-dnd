export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.OeNnxNxa.js",app:"_app/immutable/entry/app.C_LO4Gp8.js",imports:["_app/immutable/entry/start.OeNnxNxa.js","_app/immutable/chunks/C2S8dO_a.js","_app/immutable/chunks/DcpbNT_s.js","_app/immutable/chunks/CDeVKmP5.js","_app/immutable/entry/app.C_LO4Gp8.js","_app/immutable/chunks/DcpbNT_s.js","_app/immutable/chunks/tS9Qonx5.js","_app/immutable/chunks/DpGJeBF8.js","_app/immutable/chunks/CDeVKmP5.js","_app/immutable/chunks/5VQd14N9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
