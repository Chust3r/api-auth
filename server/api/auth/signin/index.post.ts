import { object, email, string, safeParse } from 'valibot'

//→ BODY SCHEMA

const schema = object({
	email: string([email('Invalid email address')]),
	password: string('Password is required'),
})

export default eventHandler(async (event) => {
	try {
		// → BODY VALIDATION

		const body = await readValidatedBody(event, (d) => safeParse(schema, d))

		if (!body.success) return Response.json(body.issues, { status: 400 })

		const { email, password } = body.output

		//→ CREDENTIALS VALIDATION

		const user = await prisma.user.findFirst({
			where: {
				email,
			},
		})

		if (!user || !compare(password, user?.password)) {
			return Response.json(
				{
					message: 'Unauthorized',
				},
				{ status: 401 }
			)
		}

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

		return Response.json({ message: 'User signed in' }, { status: 200 })
	} catch (e) {
		console.log(['SIGN IN ERROR', e])

		return Response.json(
			{
				message: 'Server error',
			},
			{ status: 500 }
		)
	}
})
