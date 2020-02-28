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
          return \`${fs.readFileSync(templatePath, 'utf-8') }\`
        }
    })`,
    templateContext
  );

  return templateCache[ templatePath ]
}


router.get('/index.html', async (ctx, next) => {
  ctx.body = createTemplate('./public/index.htm')({ users })
})

app.use(router.routes(), router.allowedMethods)

app.listen(3000)