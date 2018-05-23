# 开发/生产环境打包
## 1. 目标
    1). 理解开发环境与生产环境
    2). 开发环境: 
        实现live-reload
        开启sourceMap调试
    3). 生产环境: 
        单独打包css, 
        单独打包第三方JS包, 
        打包文件缓存处理
        压缩JS/CSS
    4). 代码分割(code split)与懒加载(lazy load)
        
## 2. 下载依赖包
    npm install --save-dev webpack-dev-server  // webpack开发服务器
    npm install --save-dev webpack-merge  // 合并webpack配置
    npm install --save-dev clean-webpack-plugin   //清理文件插件
    npm install --save-dev extract-text-webpack-plugin  //抽取css单独打包插件
    npm install --save-dev optimize-css-assets-webpack-plugin  // 压缩css的插件

## 3. 编码(在DEMO2的基础上)
    1). src/js/atguigu.js
        export function studyConfirm() {
          return confirm('你确定要来尚硅谷学习吗?')
        }
        
        export function goAtguigu() {
          window.location = 'http://www.atguigu.com'
        }
    2). src/index.js
        import $ from 'jquery'
        import {cube} from "./js/math"
        import lessons from './assets/json/lessons.json'
        import './assets/css/style.css'
        
        console.log(cube(3))
        
        $(function () {
          const $app = $('#app')
          // 根据json数据显示一个列表
          const $ul = $('<ul>')
          $app.append($ul)
          lessons.forEach(lesson => {
            $ul.append(`<li>课程名: <span class="lesson-name">${lesson.name}</span>, 时间: ${lesson.days}天</li>`)
          })
          
          // 添加一个按钮
          const $button = $('<button>我要学习</button>')
          $button.click(function () {
            import('./js/atguigu').then(atguigu => {
              if(atguigu.studyConfirm()) {
                atguigu.goAtguigu()
              }
            })
          })
          $app.append($button)
        })
    
## 4. webpack配置
    1). 基础配置: build/webpack.base.conf.js
        const path = require('path')
        const HtmlPlugin = require('html-webpack-plugin')
        
        function resolve(dir) {
          return path.resolve(__dirname, '..', dir)
        }
        
        module.exports = {
          // 入口
          entry: {
            app: './src/index.js'
          },

          // 出口
          output: {
            path: resolve('dist')
          },
        
          // 模块加载
          module: {
            rules: [
              // 处理js
              {
                test: /\.js$/,
                use: 'babel-loader',
                include: [resolve('src')]
              },
              // 处理图片
              {
                test: /\.(jpg|png|svg|gif)$/,
                loader: 'url-loader',
                options: {
                  limit: 1000, // 进行图片base64编码处理的文件最大值
                  name: 'static/img/[name].[hash:8].[ext]' // 生成的文件路径和文件名
                }
              }
            ]
          },
          // 插件
          plugins: [
            // 生成html
            new HtmlPlugin({
              template: 'index.html',
              filename: 'index.html',
              inject: true
            })
          ]
        }
        
    2). 开发环境配置: build/webpack.dev.conf.js
        const merge = require('webpack-merge')
        const baseConfig = require('./webpack.base.conf')
        
        module.exports = merge(baseConfig, {
		  // 出口
          output: {
            filename: '[name].js' 
          },

          // 模块加载器
          module: {
            rules: [
              // 加载css
              {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
              }
            ]
          },
          // 开启开发环境下的: sourceMap调试
          devtool: 'cheap-module-eval-source-map',
        })
        
    3). 生产环境配置: build/webpack.prod.conf.js
        const path = require('path')
        const webpack = require('webpack')
        const merge = require('webpack-merge')
        const ExtractTextPlugin = require('extract-text-webpack-plugin')
        const CleanPlugin = require('clean-webpack-plugin')
        const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
        const baseConfig = require('./webpack.base.conf')
        
        function resolve(dir) {
          return path.resolve(__dirname, '..', dir)
        }
        
        module.exports = merge(baseConfig, { // 合并配置
          // 入口
          entry: {
            // 指定第三方模块包含哪些
            vendor: ["jquery"]
          },
          
		  // 出口
          output: {
            filename: 'static/js/[name].[chunkhash].js',
			publicPath: '/' // 所有引用的虚拟路径前都添加上此值
          },

          // 模块加载器
          module: {
            rules: [
              // 加载css
              {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({ // 抽取css
                  use: 'css-loader'
                })
              }
            ]
          },
          // 插件
          plugins: [
            // 清理dist文件夹
            new CleanPlugin(['dist'], {
              root: resolve('')
            }),
            // 抽取所有css到指定文件
            new ExtractTextPlugin({
              filename: 'static/css/[name].[contenthash].css'
            }),
            // 第三方包模块单独打包
            new webpack.optimize.CommonsChunkPlugin({
              name: 'vendor'
            }),
            // 将webpack模板代码单独打包
            new webpack.optimize.CommonsChunkPlugin({
              name: 'runtime'
            }),
            
			// 压缩css
            new OptimizeCssPlugin(),
            // 压缩JS
            new webpack.optimize.UglifyJsPlugin({
              compress: {  //压缩配置
			  	warnings: false  // 不显示警告
			  }
            })
          ]
        })
        
## 4. 打包运行命令配置
    "scripts": {
      "dev": "webpack-dev-server --config build/webpack.dev.conf.js --open",
      "build": "webpack --config build/webpack.prod.conf.js",
      "client": "serve dist"
    }

## 5. 打包运行
    1). 开发打包运行
        npm run dev
        修改js/css, 直接查看效果
    2). 生产打包运行
        npm run build
        npm run client

## 6. 总结
	1). 为开发环境/生产环境编写不同的配置
	2). live-reload的理解和配置实现
	3). source-map的理解和配置实现
	4). 理解代码分割和配置实现
	5). 单独打包css
    6). 单独打包第三方JS包, 
	7). 打包文件缓存处理
    8). 模块懒加载
	9). 压缩JS/CSS
	
## 7. 待解决问题
	1). 未处理css预编译器语法解析
	2). 未实现HMR/hot-read(只是实现了live-reload)
	3). 未处理eslint语法检查
	4). 未处理react/vue语法解析