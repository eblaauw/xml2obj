# xml2obj -- 基于node-xml

Same usage with big-xml

## Install

    npm install xml2obj


#Example

XML files are streamed, and parsed one record at a time, which keeps memory usage low.

You must specify which XML elements should be considered as the root of a record, using a regex. In this
example the elements Foo and Bar will be emitted as records.

```javascript
var xml = require('xml2obj');
    
var reader = xml.createReader('data.xml.gz', /^(Foo|Bar)$/, { gzip: true });

reader.on('record', function(record) {
  console.log(record);
});
```

The output would take the form:

```javascript
{ tag: 'Foo',
  attrs: { Name: 'John', Status: 'Student' },
  children: [
    { tag: 'Color', text: 'blue'} 
  ]
}
```