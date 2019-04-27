const list = require('./list');
list.command({
  path: '.',
}, (err, files) => {
  console.log(files);
});

walk(input, {
  true: () => {

  },
  false: () => {

  },
},
})