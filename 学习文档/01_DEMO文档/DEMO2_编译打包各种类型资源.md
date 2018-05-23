# 编译打包各种类型资源
## 1. 目标
    1). 利用loader打包项目中的各种类型资源: JS(ES6) / CSS / 图片 / JSON
    2). 利用plugin生成动态引入打包文件的html页面
    3). 掌握webpack配置文件编写(结构)
    4). 进一步理解模块化打包
    5). 掌握项目的打包和发布
    
## 2. 下载依赖包
    1). jquery包
        npm install --save jquery@1.12
    2). babel相关包
        npm install --save-dev babel-loader babel-core babel-preset-env babel-preset-stage-2 babel-plugin-transform-runtime
    3). 处理css文件的包
        npm install --save-dev css-loader style-loader
    4). 处理图片的包
        npm install --save-dev url-loader file-loader
    5). 处理HTML
        npm install --save-dev html-webpack-plugin

	
    
## 3. 编码
    1). 创建整体结构
        demo2
            |--src
                |--assets
                    |--css
                    |--img
                    |--json
                | --js
                |--index.js
            |--index.html
            |--webpack.config.js

    2). index.html
        <h1>尚硅谷后期课程</h1>
        <div id="app"></div> 
  
    3). 添加图片: assets/img/atguigu.jpg
		![atguigu](https://i.imgur.com/bwjnJL8.jpg)

    4). 添加样式: assets/css/style.css
        body {
          padding: 20px;
          background: url("../img/atguigu.jpg");
          font-size: 20px;
        }
        .lesson-name {
          color: red;
          font-size: 25px;
        }

    5). 添加json: assets/json/lessons.json
        [
          {
            "name": "ES5/6/7",
            "days": 2
          },
          {
            "name": "JS高级",
            "days": 3
          },
          {
            "name": "JS模块化",
            "days": 1.5
          },
          {
            "name": "react全家桶",
            "days": 4
          },
          {
            "name": "react全栈项目",
            "days": 6
          },
          {
            "name": "vue全家桶",
            "days": 4
          },
		  {
            "name": "vue项目",
            "days": 6
          },
          {
            "name": "webpack模块化打包",
            "days": 2
          },
          {
            "name": "项目实战",
            "days": 7
          }
        ]

    6). 添加自定义JS模块: src/js/math.js
        export function square(x) {
          return x * x
        }
        export function cube(x) {
          return x * x * x
        }

    7). 实现入口js编码: src/index.js
        // 引入js模块
		import $ from 'jquery'
		import {cube} from "./js/math"
		// 引入json模块
		import lessons from './assets/json/lessons.json'
		// 引入css模块
		import './assets/css/style.css'
        
        console.log(cube(3))
        
        $(function () {
          const $app = $('#app')
          const $ul = $('<ul>')
          $app.append($ul)
          lessons.forEach(lesson => {
            $ul.append(`<li>课程名: <span class="lesson-name">${lesson.name}</span>, 时间: ${lesson.days}天</li>`)
          })
        })
        
## 4. 配置
    1). babel配置: .babelrc
        {
          "presets": ["env", "stage-2"],
          "plugins": ["transform-runtime"]
        } 

		说明: 
			babel-presets-env: 包含es2015/es2016/es2017所有新的标准语法的解析器
			babel-presets-stage-2: 包含了一些草案语法的解析器(如: import())
			babel-plugin-transform-runtime: 此包能减小编译生成的es5代码

    2). webpack配置: webpack.config.js
        const path = require('path') // node内置模块(操作路径信息)
		const HtmlPlugin = require('html-webpack-plugin') // 打包生成html
		
		/*
		得到指定目录的绝对路径
		 */
		function resolve(dir) {
		  return path.resolve(__dirname, dir)
		}
		
		module.exports = {
		  // 入口
		  entry: './src/index.js',
		
		  // 出口
		  output: {
		    path: resolve('dist'), // 所有打包生成文件的基础目录
		    filename: 'bundle.js'
		  },
		  // 模块加载器
		  module: {
		    rules: [
		      // 将es6编译为es5
		      {
		        test: /\.js$/,   // 用来匹配处理模块文件的正则
		        loader: 'babel-loader', // 加载器包名
		        include: [resolve('src')] // 只针对哪些文件夹下的模块进行处理
		      },
		      // 加载css
		      {
		        test: /\.css$/,
		        use: ['style-loader', 'css-loader']  // style(css('xxx.css'))
		      },
		      // 加载img
		      {
		        test: /\.(png|jpg|gif|svg)$/,
		        use: 'file-loader'
		      },
		    ]
		  },
		  // 插件
		  plugins: [
		    new HtmlPlugin({
		      template: 'index.html', // 在执行命令所在目录查找
		      filename: 'index.html', // 在output.path指定的输出目录中生成
		      inject: true // 向页面中自动引入打包生成的js/css
		    })
		  ]
		}

    3). 添加打包命令配置: package.json
        "scripts": {
          "build": "webpack",
          "client": "serve dist"
        },
        
## 5. 打包发布项目
    npm run build
    npm install -g serve
    serve dist (npm run client)
    访问: http://localhost:5000

## 6. 总结
	1). 使用loader打包各种类型的模块
    2). 使用plugin打包html
    3). webpack配置文件编写(结构)
    4). 项目的打包和发布

## 7. 待解决问题
    1). 修改代码, 如何能立即看到最新的效果?
    2). 打包JS运行, 如何更方便调试?
    3). 如何将CSS单独打包?
    4). 如何将第三方JS单独打包?
    5). 如何利用/防止浏览器对js/css/img的缓存?