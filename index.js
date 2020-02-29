const Koa = require('koa')
const Router = require('@koa/router')
const static = require('koa-static')
const app = new Koa()
const router = new Router()
const users = require('./data')
const fs = require('fs')
const vm = require('vm')

app.use(static(__dirname + '/public'))

const templateCache = {};

const templateContext = vm.createContext({
  include: function (name, data = {}) {
    const template = templateCache[ name ] || createTemplate(name)
    return template(data);
  }
});

function createTemplate (templatePath) {
  templateCache[ templatePath ] = vm.runInContext(
    `(function (data) {
        with (data) {
          return \`${fs.readFileSync(templatePath)}\`
        }
    })`,
    templateContext
  );

  return templateCache[ templatePath ]
}


// router.get('/index.html', async (ctx, next) => {
//   ctx.body = createTemplate('./public/index.htm')({ users })
// })

// 在 HTTP 请求期间：
// 减少不必要的计算
// 空间换时间
// 提前计算
const indexBuffer = createTemplate('./public/index.htm')({ users })
router.get('/index.html', async (ctx, next) => {
  ctx.status = 200
  ctx.type = 'html'
  ctx.body = indexBuffer
})

app.use(router.routes(), router.allowedMethods)

app.listen(3000)