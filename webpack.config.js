import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  entry: {
    clean: './src/handlers/clean/handler.ts',
    filter: './src/handlers/filter/handler.ts',
    store: './src/handlers/store/handler.ts',
  },
  externals: 'aws-sdk',
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }]
  },
  output: {
    clean: true,
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, './dist')
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  target: 'node'
}
