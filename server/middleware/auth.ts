export default eventHandler(async (event) => {
	try {
		const url = getRequestURL(event)

		if (!url.pathname.includes('/user')) return

		// → GET COOKIES FROM REQUEST

		const cookies = parseCookies(event)

		const { Authentication, Refresh } = cookies

		if (!Authentication || !Refresh)
			return Response.json({ message: 'Unauthorized' }, { status: 401 })

		// → GET DATA FROM JWT & REFRESH TOKEN

		const jwt = await readJWT(Authentication)

		const refresh = await readJWT(Refresh)

		// → CHECK IF JWT AND REFRESH TOKEN ARE VALID

		if (jwt.isValid && refresh.isValid) {
			return
		}

		if (!jwt.isValid && !refresh.isValid) {
			return Response.json({ message: 'Unauthorized' }, { status: 401 })
		}

		// → IF REFRESH TOKEN IS VALID CREATE A NEW JWT AND REFRESH TOKEN

		if (!refresh.isValid)
			return Response.json({ message: 'Unauthorized' }, { status: 401 })

		// → CREATE A NEW JWT & REFRESH TOKEN

		const id = jwt.payload?.id

		const newJwt = await createJWT({ id }, JWT_EXP)

		const newRefresh = await createJWT({ id }, REFRESH_EXP)

		// → SET JWT & REFRESH TOKEN IN COOKIES

		setCookie(event, 'Authentication', newJwt, {
			httpOnly: true,
		})

		setCookie(event, 'Refresh', newRefresh, {
			httpOnly: true,
		})
	} catch (e) {
		console.log(['AUTH MIDDLWARE ERROR', e])
		return Response.json({ message: 'Server Error' }, { status: 500 })
	}
})
