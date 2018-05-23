const merge = require('webpack-merge')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
const path = require('path')

const baseConfig = require('./webpack.base.conf')

function resolve(dir) {
  return path.resolve(__dirname, '..', dir)
}

module.exports = merge(baseConfig, {
  output: {
    path: resolve('dist'),
    filename: 'static/js/[name].[chunkhash].js'
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader'],
          fallback: 'vue-style-loader'
        })
      },
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'stylus-loader'],
          fallback: 'vue-style-loader'
        })
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: ['css-loader'],
              fallback: 'vue-style-loader' // 编译后用什么loader来提取css文件
            }),
            stylus: ExtractTextPlugin.extract({
              use: ['css-loader', 'stylus-loader'],
              fallback: 'vue-style-loader'
            })
          },
          // 声明在解析到指定标签的特定属性时转换为require引入相关模块
          transformToRequire: {
            video: 'src',
            source: 'src',
            img: 'src',
            image: 'xlink:href'
          }
        }
      }
    ]
  },

  devtool: '#source-map',

  plugins: [
    // 定义编译期全局环境标识
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // 清除打包文件夹
    new CleanPlugin(['dist'], {
      root: resolve('')
    }),
    // 抽取css单独打包
    new ExtractTextPlugin({
      filename: 'static/css/[name].[contenthash].css'
    }),
    // 压缩JS
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    // 拷贝静态资源
    new CopyPlugin([
      {
        from: resolve('static'),
        to: 'static',
        ignore: ['.*']
      }
    ]),
    // 压缩css, 重复的样式也会被移除
    new OptimizeCssPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // 此插件根据代码内容生成hash作为模块的id(默认是下标)
    new webpack.HashedModuleIdsPlugin(),
    // 此插件将第三方模块单独打包到vendor.js中
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // 任何引入的node_modules下的模块都打包到vendor中
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // 将webpack的runtime和manifest代码单独打包到manifest.js中
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor'] // 从vendor中抽取
    }),
    // 生成html页面
    new HtmlPlugin({
      template: 'index.html',
      filename: 'index.html',
      inject: true
    })
  ]
})