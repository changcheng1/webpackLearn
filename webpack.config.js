const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
// 多进程打包，提升打包速度
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
// 文件拷贝
const copyWebpackPlugin = require('copy-webpack-plugin')
// 压缩css文件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件
// 有时候把css文件单独拿出来保存加载
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 引入vueLoader，并且实例化
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// webpack 打包
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    // 入口文件
    // 先找到每个入口(Entry)，然后从各个入口出发，找到依赖的模块(Module)
    // 然后生成一个chunk(代码块)，最后把chunk写到文件系统中
    entry:{ 
        index:'./src/index.js',
    },
    output:{
        // 输出的文件，只能是绝对路径
        path:path.join(__dirname,'dist'),   
        // 打包出的hsh文件，采取8位
        filename:"[name].[hash:8].js",
    },
    // webapack优化:尽量减少搜索范围
    resolve:{
        // 缩小查询的范围
        modules:[path.resolve("node_modules"),path.resolve("lib")],
        extensions:[".js",".json",".vue"],
        // 别名
        alias:{
            'vue$':'vue/dist/vue.esm.js'
        }
    },
    // 用来定位错误文件位置
    devtool:'source-map',
    module:{
        // 不需要递归解析该模块
        // noParse:[],
        rules:[
            {
                test: /\.js$/,
                //把对.js 的文件处理交给id为happyBabel 的HappyPack 的实例执行
                loader: 'happypack/loader?id=happyBabel',
                // 只转换编译src目录下的文件
                include: path.resolve(__dirname, 'src'),
                exclude:/node_modules/

            },
            {
                test:/\.css$/, //转换文件的匹配正则
                loader: 'happypack/loader?id=styles',
                // 只转换编译src目录下的文件
                include: path.resolve(__dirname, 'src'),
                exclude:/node_modules/
            },
            {
                test: /\.vue$/,
                use:'vue-loader',
                // 只转换编译src目录下的文件
                include: path.resolve(__dirname, 'src'),
                exclude:/node_modules/
            },
            {
                test:/\.less$/, //转换文件的匹配正则
                use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',"less-loader",'postcss-loader'
                  ],
            },
            {
                test:/\.scss$/, //转换文件的匹配正则
                use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',"sass-loader",'postcss-loader'
                  ],
            },
            // file-loader是解析图片的地址，把图片从源文件拷贝到目标位置并且修改原引用地址
            // 可以处理任意的二进制，bootstrap里字体
            // url-loader可以在文件比较小的时候，直接变成base64位的字符内嵌到页面当中
            {
                test:/\.(png|jpg|gif|svg|bmp)/,
                loader:{
                    loader:'url-loader',
                    options:{
                        // 设置5K往下就转为base64位字符串
                        limit: 5 * 1024,
                        publicPath:'../images',
                        outputPath:'images/'
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
                loader: 'url-loader',
                include: path.resolve(__dirname, 'src'),
                exclude:/node_modules/
            },
        ]
    },
    plugins:[
        new BundleAnalyzerPlugin(),
        new HappyPack({
          //用id来标识 happypack处理那里类文件
            id: 'happyBabel',
            //如何处理  用法和loader 的配置一样
            loaders: [{
                loader: 'babel-loader?cacheDirectory=true',
            }],
            
        }),
        new HappyPack({
            id: 'styles',
            loaders: ['style-loader', 'css-loader', 'less-loader' ]
        }),
        // 自动向模块内部注入变量
        new webpack.ProvidePlugin({
            '$':'jquery'
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['!dll']
        }),
       
        // 此插件自动生成html文件
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            hash:true,
            title:'index',
            inject: true,
            chunks:['verder','index'],
            minify:{
                removeAttributeQuotes:true
            }
        }),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./dist/dll/manifest.json')
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "css/[name].css",
            chunkFilename: "css/[id].css"
         }),
         // 文件拷贝
         new copyWebpackPlugin([
            {
                from:'./src/public',
                to:'public'
            }
         ]),
         // 压缩css文件
         new OptimizeCssAssetsPlugin(),
         // vue-loader实例化
         new VueLoaderPlugin(),
    ],
    // webpack 内置的公共提取方法：splitChunks
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: 'commons',    //提取出来的文件命名
                    chunks: 'initial',  //initial表示提取入口文件的公共部分
                    minChunks: 2,       //表示提取公共部分最少的文件数
                    minSize: 0          //表示提取公共部分最小的大小
              }
          }
      }
    },
    // 配置静态资源服务器，用来预览打包之后的项目
    devServer:{
        contentBase:'./dist',
        host:'localhost',
        port:8081,
        // 是否启动压缩
        compress:true
    }
}