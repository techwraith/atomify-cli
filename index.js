var css = require('atomify-css')
  , js = require('atomify-js')
  , program = require('commander')
  , fs = require('fs')
  , path = require('path')

program
  .option('-c, -css [entry]', 'the entry file for the css, defaults to `./entry.css`', './entry.css')
  .option('-j, --js [entry]', 'the entry file for the js, defaults to `./entry.js`', './entry.js')
  .option('-o, --output [output]'
        , 'the name of the file to output to ' +
          '(eg. "bundle" will make "bundle.css" and "bundle.js")', "bundle")
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

js(options.js, function (err, src) {
  if (err) return console.log('error:', err.stack)
  fs.writeFileSync(options.output+'.js', src);
});

css(options.css, function (err, src) {
  if (err) return console.log('error:', err.stack)
  fs.writeFileSync(options.output+'.css', src);
});


