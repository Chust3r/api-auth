import { genSalt, hash, compare } from 'bcrypt'

export const hashPassword = async (password: string) => {
	const salt = await genSalt(10)
	const hashedPassword = await hash(password, salt)

	return hashedPassword
}

export { compare }
