var xml = require('node-xml'),
    fs = require('fs'),
    events = require('events'),
    util = require('util'),
    zlib = require('zlib');

exports.createReader = function (filename, recordRegEx, options) {
  return new XmlReader(filename, recordRegEx, options);
};

function XmlReader(filename, recordRegEx, options) {
  var self = this;

  options.lists = options.lists || [];
  options.gzip = options.gzip || false;

  var parser = new xml.SaxParser(callbacks);
  var stream = fs.createReadStream(filename);

  if (options.gzip) {
    var gunzip = zlib.createGunzip();
    stream.pipe(gunzip);
    stream = gunzip;
  }

  stream.on('data', function (data) {
    parser.parseString(data);
    self.emit('data', data);
  });

  ///////////////////////////

  var node = {};
  var nodes = [];
  var record;
  var isCapturing = false;
  var level = 0;

  function callbacks(cb) {
    cb.onStartElementNS(function (name, attrs) {
      level++;

      if (!isCapturing && !name.match(recordRegEx)) {
        return;
      }
      else if (!isCapturing) {
        isCapturing = true;
        node = {};
        nodes = [];
        record = undefined;
      }

      if (node.children === undefined) {
        node.children = [];
      }

      var child = { tag: name };
      node.children.push(child);

      if (Object.keys(attrs).length > 0) {
        child.attrs = attrs;
      }

      nodes.push(node);
      node = child;

      if (name.match(recordRegEx)) {
        record = node;
      }
    });

    cb.onCharacters(function (txt) {
      if (!isCapturing) {
        return;
      }

      txt = txt.trimLeft();

      if (txt.length > 0) {
        node.text = txt;
      }
    });

    cb.onEndElementNS(function (name) {
      level--;
      node = nodes.pop();

      if (name.match(recordRegEx)) {
        isCapturing = false;
        self.emit('record', record);
      }

      if (level === 0) {
        self.emit('end');
      }

    });

  }


}
util.inherits(XmlReader, events.EventEmitter);