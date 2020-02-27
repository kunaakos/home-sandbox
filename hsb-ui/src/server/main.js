const path = require('path')
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()

app.use(
	'/wsapi',
	createProxyMiddleware('/', { target: process.env.THINGS_URL, ws: true })
)

app.use(
	'/',
	express.static(path.join(__dirname, '../../build/client'))
)

app.listen(process.env.UI_PORT, () => {
	console.log(`App listening on port ${process.env.UI_PORT}.`)
})
