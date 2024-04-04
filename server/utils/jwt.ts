import { SignJWT, jwtVerify } from 'jose'

type Payload = Record<string, string>

const encoder = new TextEncoder()
const secret = encoder.encode(process.env.JWTKEY || 'secret')

// → CREATE A JWT

export const createJWT = async (payload: Payload, expirationTime: string) => {
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

// → READ A JWT AND CHECK IF IT IS VALID

export const readJWT = async (token: string) => {
	try {
		const data = await jwtVerify(token, secret)
		return { isValid: true, payload: data.payload as Payload }
	} catch (e) {
		return { isValid: false }
	}
}
