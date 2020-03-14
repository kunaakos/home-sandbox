import styled from '@emotion/styled'

export const Card = styled.div`
	background: ${({theme}) => theme.colors.bg1};
	color: ${({theme}) => theme.colors.fg1};
	padding: 1rem;
`

export const CardContainer = styled.div`
	${Card} + ${Card} {
		margin-top: 1rem;
	}
`
