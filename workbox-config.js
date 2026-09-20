module.exports = {
	globDirectory: "publish/",
	globPatterns: [
		"**/*.{css,js,json,ico,ttf,txt,png,jpg,svg,html}",
	],
	swDest: "publish/sw.js",
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	skipWaiting: true,
	clientsClaim: true,
	maximumFileSizeToCacheInBytes: 5242880,
};