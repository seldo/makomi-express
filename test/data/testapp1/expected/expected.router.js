// AUTOMATICALLY GENERATED. DO NOT EDIT.
// The droid you're looking for is .makomi/routes.json

module.exports = function(app){
  var index = require('./controllers/index/_actions')
    , users = require('./controllers/users/_actions')
    , news = require('./controllers/news/_actions')
    , basic = require('./controllers/basic/_actions');

  app.get('/', index.index);
  app.get('/users', users.list);
  app.get('/users/:page', users.list);
  app.get('/user/profile', users.self);
  app.get('/user/:id', users.show);
  app.get('/more-news', news.more);
  app.get('/more-news/page/:page', news.more);
  app.get('/basic/flat', basic.flat);
}
