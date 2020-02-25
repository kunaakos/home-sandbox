import path from 'path'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()

app.use(
	'/wsapi',
	createProxyMiddleware('/', { target: process.env.THINGS_URL, ws: true })
)
app.use(
	'/',
	express.static(path.join(__dirname, '../../build/client'))
)

app.listen(process.env.UI_PORT)
