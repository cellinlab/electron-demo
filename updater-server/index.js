const static = require('koa-static')
const Koa = require('koa')

const path = require('path')

const app = new Koa()

app.use(static(path.join(__dirname, './static')))

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})
