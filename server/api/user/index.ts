export default eventHandler(async (event) => {
	return Response.json({
		message: 'Hello World!',
	})
})
