const static = require('koa-static')
const Koa = require('koa')
const logger = require('koa-logger')

const path = require('path')

const app = new Koa()

app.use(logger())
app.use(static(path.join(__dirname, './dist')))

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})
