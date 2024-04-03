import { createTransport } from 'nodemailer'

export const mailer = createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	auth: {
		user: 'kriptoortega@gmail.com',
		pass: 'ywhw qyda khji ocng',
	},
})
