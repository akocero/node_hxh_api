module.exports = function (model_export) {
	let routes = [];
	for (const [key, value] of Object.entries(model_export)) {
		const Router = model_export[key];
		Router.stack.forEach((route) => {
			const method = Object.keys(route.route.methods)[0]
				.toString()
				.toUpperCase();
			const path = route.route.path.toString();
			const prefix = 'api/v1';
			routes.push({
				method,
				prefix,
				path,
			});
		});
	}
	console.table(routes);
};
