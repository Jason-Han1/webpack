const webpack = require('webpack')
const webpackConfig = require('./webpack.prod.conf')

console.log('开始打包中...')
webpack(webpackConfig, function (error, stats) {
  console.log('打包完成')
})