#!/usr/bin/env node

var css = require('atomify-css')
  , js = require('atomify-js')
  , hb = require('handlebars')
  , program = require('commander')
  , fs = require('fs')
  , lingo = require('lingo')
  , path = require('path')

program
  .option('-c, --css [entry]', 'the entry file for the css, defaults to `./entry.css`', './entry.css')
  .option('-j, --js [entry]', 'the entry file for the js, defaults to `./entry.js`', './entry.js')
  .option('-o, --output [output]'
        , 'the name of the file to output to ' +
          '(eg. "bundle" will make "bundle.css" and "bundle.js")', "bundle")
  .option('atoms', 'will create an atoms directory and fill it with an atom for each common html tag.')
  .option('uncommon', 'will create atoms in the atoms directory for the uncommon html tags (run separately).')
  .parse(process.argv)

var options = {
  js: {
    entry: program.js
  }
, css: {
    entry: program.Css
  }
, output: program.output
}

var cssTemp = hb.compile('@import "../global";\n\
\n\
{{tagname}} {\n\
\n\
}\n\
');

var jsTemp = hb.compile("var Base = require('ribcage-view')\n\
\n\
var {{ctor}} = Base.extend({\n\
  tagname: '{{tagname}}'\n\
})\n\
\n\
module.exports = {{ctor}}\n\
");

// Lets build some atoms
if (program.atoms) {
  var common = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'address', 'p', 'hr', 'pre', 'blockquote',
    'ol', 'ul', 'li',
    'dl', 'dt', 'dd',
    'a', 'em', 'strong', 'small', 'code',
    'sub', 'sup', 'i', 'b', 'u',
    'span', 'ins', 'del',
    'img', 'video', 'audio', 'caption',
    'table', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th',
    'form', 'fieldset', 'legend', 'label', 'input', 'button', 'select',
    'option', 'textarea', 'menu', 'menuitem'
  ];

  var uncommon = [
    'section', 'nav', 'article', 'aside', 'header', 'footer', 'main',
    's', 'cite', 'q', 'dfn', 'abbr', 'time', 'var', 'samp', 'kbd', 'mark',
    'ruby', 'rt', 'rp', 'bdi', 'bdo', 'br', 'wbr',
    'iframe', 'embed', 'object', 'param', 'source', 'track',
    'canvas', 'map', 'area', 'svg', 'math',
    'datalist', 'optgroup', 'keygen', 'progress', 'meter', 'summary', 'details'
  ];

  if (program.uncommon) {
    var tags = uncommon;
  } else {
    var tags = common;
  }

  if (!fs.existsSync('atoms')) {
    fs.mkdirSync('atoms');
  }

  for (var i in tags) {

    console.log('creating: '+tags[i]);

    if (fs.existsSync('atoms/'+tags[i])) {
      console.log('... already exists');
      continue;
    }

    fs.mkdirSync('atoms/'+tags[i]);

    var opts = {
      tagname: tags[i]
    , ctor: lingo.capitalize(tags[i])
    }
    fs.writeFileSync(path.join('atoms', tags[i], tags[i] + '.css'), cssTemp(opts));
    fs.writeFileSync(path.join('atoms', tags[i], tags[i] + '.js'), jsTemp(opts));

    var packageObj = {
      style: tags[i]+'.css'
    , main: tags[i]+'.js'
    }
    fs.writeFileSync(path.join('atoms', tags[i], 'package.json'), JSON.stringify(packageObj, null, 2));

  }

  console.log('done')

}
// This is a normal bundle command
else {

  js(options.js, function (err, src) {
    if (err) return console.log('error:', err.stack)
    fs.writeFileSync(options.output+'.js', src);
  });

  if (fs.existsSync(options.css)) {
    css(options.css, function (err, src) {
      if (err) return console.log('error:', err.stack)
      fs.writeFileSync(options.output+'.css', src);
    });
  }

}
