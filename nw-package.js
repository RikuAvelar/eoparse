var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
    files: './{css,font,images,js,node_modules,server,src,*.ico,*.png,*.html,*.json}{/**,*}', // use the glob format
    appName: 'eoparse',
    platforms: ['win64'],
    flavor: 'sdk',
    zip: false
});

// Log stuff you want
nw.on('log',  console.log);

nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});