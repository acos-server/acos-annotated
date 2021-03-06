var fs = require('fs');
var htmlencode = require('htmlencode').htmlEncode;

var Annotated = function() {};

Annotated.addToHead = function(params) {
  return '<link href="/static/annotated/style.css" rel="stylesheet">\n' +
    '<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" type="text/css">' +
    '<link href="https://fonts.googleapis.com/css?family=Inconsolata:400,700" rel="stylesheet" type="text/css">' +
    '<script src="/static/annotated/jquery.min.js" type="text/javascript"></script>\n' +
    '<script src="/static/annotated/annotated.js" type="text/javascript"></script>\n';
};

Annotated.addToBody = function(params) {
  return '';
};

Annotated.initialize = function(req, params, handlers, cb) {

  // Initialize the content type
  params.headContent += Annotated.addToHead(params);
  params.bodyContent += Annotated.addToBody(params);

  // Initialize the content package
  handlers.contentPackages[req.params.contentPackage].initialize(req, params, handlers, function() {
    cb();
  });
};

Annotated.handleEvent = function(event, payload, req, res, protocolPayload, responseObj, cb) {
  var dir = Annotated.config.logDirectory + '/annotated/' + req.params.contentPackage;
  if (event === 'log') {
    fs.mkdir(dir, 0775, function(err) {
      var name = payload.exampleId.replace(/\.|\/|\\|~/g, "-") + '.log';
      var data = new Date().toISOString() + ' ' + JSON.stringify(payload) + ' ' + JSON.stringify(protocolPayload || {}) + '\n';
      fs.writeFile(dir + '/' + name, data, { flag: 'a' }, function(err) {
        cb(event, payload, req, res, protocolPayload, responseObj);
      });
    });
  } else {
    cb(event, payload, req, res, protocolPayload, responseObj);
  }
};

Annotated.register = function(handlers, app, conf) {
  handlers.contentTypes.annotated = Annotated;
  fs.mkdir(conf.logDirectory + '/annotated', 0775, function(err) {});
  Annotated.config = conf;
};

Annotated.namespace = 'annotated';
Annotated.installedContentPackages = [];
Annotated.packageType = 'content-type';

Annotated.meta = {
  'name': 'annotated',
  'shortDescription': 'Content type for annotated examples.',
  'description': '',
  'author': 'Teemu Sirkiä',
  'license': 'MIT',
  'version': '0.2.0',
  'url': ''
};

module.exports = Annotated;
