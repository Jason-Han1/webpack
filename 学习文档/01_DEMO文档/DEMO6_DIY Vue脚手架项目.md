## 1. 当前环境已实现的特性:
    能对es6, css, 图片资源进行打包
    开启sourceMap调试
    区分开发环境和生产环境
    开发环境下: 实现live-reload
    生产环境下: css单独打包, 通过hash文件名利用浏览器缓存

    更多类型文件编译打包: vue文件, stylus样式, 字体文件
    热模替换(HMR)
    打包文件压缩处理
    加载全局静态资源
    抽取公共代码单独打包: 第三方模块和webpack的模板代码
    使用eslint进行代码规范检查
		
## 2. 下载依赖包
    npm install --save-dev webpack // webpack核心包
    npm install --save-dev babel-loader //编译ES6 JS的loader
	npm install --save-dev babel-core babel-preset-env babel-plugin-transform-runtime  //babel需要的相关包
    npm install --save-dev css-loader //加载css到js
	npm install --save-dev style-loader //将js中的css插入到页面
    npm install --save-dev file-loader url-loader // 加载打包图片/图标字体等资源
    npm install --save-dev webpack-merge  //用来合并多个webpack配置的工具
    npm install --save-dev webpack-dev-server  //webpack开发服务器
    npm install --save-dev html-webpack-plugin  //自动生成html页面插件
    npm install --save-dev clean-webpack-plugin  //清理文件/夹插件
    npm install --save-dev extract-text-webpack-plugin  //打包css的插件
    
	npm install --save vue //vue核心包
	npm install --save-dev vue-loader vue-template-compiler  //编译vue文件的包
	npm install --save-dev vue-style-loader  //用来代替style-loader
	npm install --save-dev stylus-loader stylus  //编译stylus的相关包
	npm install --save-dev optimize-css-assets-webpack-plugin //压缩css的插件
	npm install --save-dev express webpack-dev-middleware webpack-hot-middleware 
	npm install --save-dev opn //自动打浏览器小工具
	npm install --save-dev copy-webpack-plugin  //拷贝静态资源文件的插件
	npm install --save-dev babel-preset-stage-2 //编译import()

## 3. babel配置(.babelrc)
    {
      "presets": ["env", "stage-2"],
      "plugins": ["transform-runtime"]
    }

## 4. webpack配置
### 1). build/webpack.base.conf.js
    const path = require('path')
	// 得到指定目录的绝对路径
	function resolve(dir) {
	  return path.resolve(__dirname, '..', dir)
	}
	
	module.exports = {
	  // 入口
	  entry: {
	    app: './src/main.js'
	  },
	  // 输出
	  output: {
	    path: resolve('dist'),
	    filename: '[name].js'
	  },
	
	  module: {
	    rules: [
	      // 加载js
	      {
	        test: /\.js$/,
	        use: 'babel-loader',
	        include: [resolve('src')]
	      },
	      // 加载图片
	      {
	        test: /\.(png|jpe?g|svg|gif)$/,
	        loader: 'url-loader',
	        options: {
	          limit: 1000,
	          name: 'static/img/[name].[hash:7].[ext]'
	        }
	      },
	      // 加载图标字体
	      {
	        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
	        loader: 'url-loader',
	        options: {
	          limit: 10000,
	          name: 'static/fonts/[name].[hash:7].[ext]'
	        }
	      }
	    ]
	  },
	
	  resolve: {
	    // 可以省略的文件后缀
	    extensions: ['.js', '.vue'],
	    // 路径别名
	    alias: {
	      '@': resolve('src'),
	      'components': resolve('src/components'),
	    }
	  }
	}

### 2). build/webpack.prod.conf.js
	const merge = require('webpack-merge')
	const HtmlPlugin = require('html-webpack-plugin')
	const CleanPlugin = require('clean-webpack-plugin')
	const ExtractTextPlugin = require('extract-text-webpack-plugin')
	const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
	var CopyPlugin = require('copy-webpack-plugin')
	const path = require('path')
	const webpack = require('webpack')
	
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
	      // 加载css文件
	      {
	        test: /\.css$/,
	        use: ExtractTextPlugin.extract({
	          use: 'css-loader',
	          fallback: 'vue-style-loader'
	        })
	      },
	      // 编译加载styl文件
	      {
	        test: /\.styl$/,
	        use: ExtractTextPlugin.extract({
	          use: ["css-loader", "stylus-loader"],
	          fallback: 'vue-style-loader'
	        })
	      },
	      // 编译加载vue文件
	      {
	        test: /\.vue$/,
	        loader: 'vue-loader',
	        options: {
	          loaders: {
	            css: ExtractTextPlugin.extract({
	              use: "css-loader",
	              fallback: 'vue-style-loader'
	            }),
	            stylus: ExtractTextPlugin.extract({
	              use: ["css-loader", "stylus-loader"],
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
	  // 使用sourceMap
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

### 3). build/webpack.dev.conf.js
	const merge = require('webpack-merge')
	const HtmlPlugin = require('html-webpack-plugin')
	const webpack = require('webpack')
	
	const baseConfig = require('./webpack.base.conf')
	
	// 应用HMR: 将HMR相对路径添加到webpack.base.conf中的每个entry前
	Object.keys(baseConfig.entry).forEach(function (name) {
	  baseConfig.entry[name] = ['./build/dev-client'].concat(baseConfig.entry[name])
	})
	
	module.exports = merge(baseConfig, {
	  module: {
	    rules: [
	      // 加载css文件
	      {
	        test: /\.css$/,
	        loader: ['vue-style-loader', 'css-loader']
	      },
	      // 编译加载styl文件
	      {
	        test: /\.styl$/,
	        loader: ['vue-style-loader', 'css-loader', 'stylus-loader']
	      },
	      // 编译加载vue文件
	      {
	        test: /\.vue$/,
	        loader: 'vue-loader',
	        options: {
	          // 处理vue中的样式
	          loaders: {
	            css: ['vue-style-loader', 'css-loader'],
	            styl: ['vue-style-loader', 'css-loader', "stylus-loader"],
	          },
	          // 将以下标签的指定属性转换为引包
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
	  // 使用sourceMap
	  devtool: 'cheap-module-eval-source-map',
	
	  plugins: [
        //在编译开始时指定全局环境为开发环境
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"development"'
          }
        }),
	    // 用于HMR的插件
	    new webpack.HotModuleReplacementPlugin(),
	    // 生成html文件
	    new HtmlPlugin({
	      template: 'index.html',
	      filename: 'index.html',
	      inject: true
	    })
	  ]
	})
    
### 4). build/dev-client.js
	// 引入whm包的client模块
	var hotClient = require('webpack-hot-middleware/client')

### 5). build/build.js
	const webpack = require('webpack')
	const webpackConfig = require('./webpack.prod.conf')
	
	console.log('开始打包...')
	// 加载配置进行打包, 打包完成输出提示
	webpack(webpackConfig, function (err, stats) {
	  console.log('打包完成')
	})

### 6). build/dev-server.js
	const express = require('express')
	const webpack = require('webpack')
	const wdm = require('webpack-dev-middleware')
	const whm = require('webpack-hot-middleware')
	const opn = require('opn')
	const webpackConfig = require('./webpack.dev.conf')
	
	// 得到应用对象
	const app = express()
	// 加载配置, 得到编译对象(还没编译)
	const compiler = webpack(webpackConfig)
	
	// 进行内存中编译打包, 并将资源挂载到服务器上
	const devMiddleware = wdm(compiler, {
	  quiet: true // 处理过程不输出任何信息
	})
	app.use(devMiddleware)
	
	// 将HMR的服务挂载到服务器上
	const hotMiddleware = whm(compiler, {
	
	})
	app.use(hotMiddleware)
	
	// 将应用static下的静态资源挂载到服务器的/static下
	const staticMiddleware = express.static('./static')
    app.use('/static', staticMiddleware)
	
	// 启动监听(8080)
	const port = 8000
	app.listen(port)
	
	//打开浏览器
	opn(`http://localhost:${port}`)


## 5. npm script配置(package.json)
    "scripts": {
      "build": "node build/build.js",
      "dev": "node build/dev-server.js",
      "server": "pushstate-server dist"
    }
    
## 6. 使用eslint进行代码检查
### 1). 下载依赖包
    npm install --save-dev eslint eslint-loader
    npm install --save-dev eslint-friendly-formatter eslint-config-standard babel-eslint
    npm install --save-dev eslint-plugin-standard eslint-plugin-html eslint-plugin-promise
    npm install --save-dev eslint-plugin-import eslint-plugin-node  //新版本需要
### 2). 配置loader
    {
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [resolve('src')],
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    }
### 3). eslint配置(.eslintrc.js)
    module.exports = {
      root: true,
      parser: 'babel-eslint',
      parserOptions: {
        sourceType: 'module'
      },
      env: {
        browser: true,
      },
      extends: 'standard',
      // required to lint *.vue files
      plugins: [
        'html'
      ],
      // add your custom rules here
      'rules': {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
      }
    }
### 4). eslint忽略配置(.eslintignore)
    build/*.js
    config/*.js