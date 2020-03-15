const path = require('path')
module.exports = {
    mode: 'development',
    entry: './test/extension/webpack-draw-polygon.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle-draw-polygon.js'
    },
    module: {
        rules: [{
            test: /\.css$/, //file end with extension .css
            loader: ['style-loader', 'css-loader']
        },
        {
            test: /\.(png|jpe?g|gif)$/i,
            loader: 'file-loader'
        },
        { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ]
    }
}