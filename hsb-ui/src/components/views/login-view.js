import React from 'react'

import { CenteredCardContainer } from '../ui-kit/cards'
import { LoginCard } from '../user-cards/login-card'

export const LoginView = ({
	login
}) => {

	return (
		<CenteredCardContainer>
			<LoginCard onSubmit={login} />
		</CenteredCardContainer>
	)

}
