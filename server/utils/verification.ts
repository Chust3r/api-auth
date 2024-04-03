type Options = {
	email: string
	userId: string
}

export const verificationCode = async ({ email, userId }: Options) => {
	try {
		// → CREATE VERIFICATION CODE

		const code = crypto.randomUUID()

		// → SAVE IN DATABASE

		await prisma.verificationCode.create({
			data: {
				code,
				userId,
			},
		})

		// → SEND EMAIL

		mailer.sendMail({
			from: process.env.EMAIL,
			to: email,
			subject: 'Verify your account',
			text: 'Verify your account',
			html: `<a>http://192.168.1.70:3000/api/auth/verify/${userId}/${code}</a>`,
		})
	} catch (e) {
		console.log(['VERIFICATION CODE ERROR', e])
	}
}
