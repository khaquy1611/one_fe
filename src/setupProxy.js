const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
	app.use(
		['/resources'],
		createProxyMiddleware({
			target: 'https://dev.onesme.vn',
			changeOrigin: true,
			pathRewrite: {
				'^/resources': '/resources', // rewrite path
			},
			proxyTimeout: 1500,
			timeout: 1500,
		}),
	);
};
