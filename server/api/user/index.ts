export default eventHandler(async (event) => {
	const { id } = event.context.payload

	const user = await prisma.user.findUnique({
		where: { id },
		select: { username: true, email: true, emailVerified: true },
	})

	return Response.json(user)
})
