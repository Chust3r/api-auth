import { SignJWT, jwtVerify } from 'jose'

type Payload = Record<string, unknown>

const encoder = new TextEncoder()
const secret = encoder.encode(process.env.JWTKEY || 'secret')

const createJWT = async (payload: Payload, expirationTime: string) => {
	try {
		const jwtConstructor = new SignJWT(payload)
		const jwt = await jwtConstructor
			.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
			.setIssuedAt()
			.setExpirationTime(expirationTime)
			.sign(secret)

		return jwt
	} catch (e) {
		console.log(['CREATE JWT ERROR', e])
	}
}

const readJWT = async (token: string) => {
	try {
		const data = await jwtVerify(token, secret)
		return { isValid: true, ...data }
	} catch (e) {
		console.log(['READ JWT ERROR', e])
		return { isValid: false }
	}
}

export { createJWT, readJWT }
