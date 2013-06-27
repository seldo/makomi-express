// AUTOMATICALLY GENERATED. DO NOT EDIT.
// The droid you're looking for is .makomi/routes.json

module.exports = function(app){
  var index = require('./controllers/index')
    , users = require('./controllers/users')
    , news = require('./controllers/news');

  app.get('/', index.index);
  app.get('/users', users.list);
  app.get('/users/:page', users.list);
  app.get('/user/profile', users.self);
  app.get('/user/:id', users.show);
  app.get('/more-news', news.more);
  app.get('/more-news/page/:page', news.more);
}
