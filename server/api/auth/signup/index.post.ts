import { object, string, email, safeParse, minLength } from 'valibot'

// → SCHEMA VALIDATION

const schema = object({
	username: string('Username is required'),
	email: string([email('Invalid email address')]),
	password: string('Password is required', [
		minLength(8, 'Password must be at least 8 characters long'),
	]),
})

export default eventHandler(async (event) => {
	try {
		// → BODY VALIDATION

		const body = await readValidatedBody(event, (d) => safeParse(schema, d))

		if (!body.success) return Response.json(body.issues, { status: 400 })

		// → CHECK IF EMAIL EXISTS ALREADY

		const { email, password, username } = body.output

		const user = await prisma.user.findUnique({ where: { email } })

		if (user)
			return Response.json(
				{ message: 'Email already exists' },
				{ status: 409 }
			)

		// → CREATE USER

		const { id } = await prisma.user.create({
			data: {
				email,
				username,
				password: await hashPassword(password),
			},
		})

		// → CREATE A JWT & REFRESH TOKEN

		const jwt = await createJWT({ id: user.id }, JWT_EXP)

		const refresh = await createJWT({ id: user.id }, REFRESH_EXP)

		//→ SET COOKIE

		setCookie(event, 'Authentication', jwt, {
			httpOnly: true,
		})

		setCookie(event, 'Refresh', refresh, {
			httpOnly: true,
		})

		// → SEND VERIFICATION CODE BY EMAIL

		await verificationCode({ email, userId: id })

		return Response.json({ message: 'User created' }, { status: 201 })
	} catch (e) {
		console.log(['SIGN UP ERROR', e])

		return Response.json(
			{
				message: 'Server error',
			},
			{ status: 500 }
		)
	}
})
