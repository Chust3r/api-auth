export default eventHandler(async (event) => {
	try {
		// → GET PARAMS

		const { userId, code } = event.context.params

		// → CHECK IF EMAIL ALREADY VERIFIED

		const user = await prisma.user.findUnique({ where: { id: userId } })

		if (user?.emailVerified)
			return Response.json(
				{ message: 'Email is already verified' },
				{ status: 400 }
			)

		// → CHECK IF CODE EXISTS

		const verify = await prisma.verificationCode.findFirst({
			where: {
				userId,
				code,
			},
		})

		// → CHECK IF CODE IS VALID

		if (!verify)
			return Response.json({ message: 'Invalid code' }, { status: 400 })

		// → DELETE CODE

		await prisma.verificationCode.delete({ where: { id: verify.id } })

		// → UPDATE USER

		await prisma.user.update({
			where: { id: userId },
			data: { emailVerified: true },
		})

		return
	} catch (e) {
		console.log(['ERROR VERIFY', e])
		return Response.json({ message: 'Server error' }, { status: 500 })
	}
})
