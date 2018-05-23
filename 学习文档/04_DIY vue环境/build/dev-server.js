const webpack = require('webpack')
const express = require('express')
const whm = require('webpack-hot-middleware')
const wdm = require('webpack-dev-middleware')
const opn = require('opn')
const webpackConfig = require('./webpack.dev.conf')

const compiler = webpack(webpackConfig)
const app = express()

const devMiddleware = wdm(compiler, {

})
app.use(devMiddleware)

const hotMiddleware = whm(compiler, {

})
app.use(hotMiddleware)

const staticMiddleware = express.static('./static')
app.use('/static', staticMiddleware)

const port = '8000'
app.listen(port)

opn(`http://localhost:${port}`)