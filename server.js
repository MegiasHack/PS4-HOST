//Creado por MegiasHack
const fs = require('fs');
const mkdirp = require('mkdirp');
const logger = require('morgan');
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const contentDisposition = require('content-disposition');
const path = require('path');
const freshUp = require('fresh-up');
//Importar
var localIpV4Address = require("local-ipv4-address");
var express = require('express');
var colors = require('colors');
console.log(`________________________________________
< mooooooooooooooooooooooooooooooooooooo >
 ----------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`, "Creado por MegiasHack".cyan.bold)
//Instanciar
var app = express();

//Ruteo
app.get('/', function(req, res){
  res.sendFile(__dirname + '/data/index.html');
});
app.get('/about', function(req, res){
  res.sendFile(__dirname + '/data/index.html');
});
 
//Escuchar
app.listen(8082);
 
console.log("Servidor Web Activado En IPv4 con puerto 8082 en modo %s".green.bold, app.settings.env);
//Mostrar IPv4
localIpV4Address().then(function(ipAddress){
    console.log("Servidor: ".cyan.bold.underline + ipAddress.red.bold.underline + ":8082".red.bold.underline);
    // My IP address is 10.4.4.137 
});

//require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  //console.log('Servidor: '.cyan.bold.underline+add.red.bold.underline+':8080'.red.bold.underline);
//})

var i = 0;  // dots counter
setInterval(function() {
  process.stdout.clearLine();  // clear current text
  process.stdout.cursorTo(0);  // move cursor to beginning of line
  i = (i + 1) % 4;
  var dots = new Array(i + 1).join(".");
  process.stdout.write("Esperando Exploit".white.bold + dots);  // write text
}, 300);

//Inicio de Dump
const port = 80;
const hourMs = 0; // 1000 * 60 * 60;

const ExcludeErrorsID = [404];

const root = path.join(__dirname/*process.cwd()*/, 'data');
const wwwRoot = root; // path.join(root, 'www');
const jssRoot = root; // path.join(root, 'www');
const jssExt = '.jss';
const sendJssErrors = true;


/** Middlewares */
//app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

/** Query */
app.use((req, res, next) => {
	req.q = (req.method === 'GET') ? req.query : req.body;
	next();
});

/** JSS server */
app.use((req, res, next) => {
    let filePath;

    const potentialIndexFile = path.resolve(jssRoot, `.${req.path}`, `./index${jssExt}`);

    if (req.path.endsWith(jssExt)) {
        filePath = path.resolve(jssRoot, `.${req.path}`);
    } else if (fs.existsSync(potentialIndexFile)) {
        filePath = potentialIndexFile;
    } else {
        return next();
    }


    if (!fs.existsSync(filePath)) {
        return next(NewError(`Not Found URL: ${req.url}`, 404));
    }

    try {
        require(filePath)(req, res); // eslint-disable-line import/no-dynamic-require
    } catch (e) {
		freshUp(require.resolve(filePath));
		
        if (sendJssErrors) {
            return res.status(500).send(`<pre>${e.stack}</pre>`);
        } else {
            return next(NewError('Server error', 500));
        }
    }

    freshUp(require.resolve(filePath));

    return undefined;
});

/** Static server */
app.use(serveIndex(wwwRoot, {'icons': true}))
app.use(serveStatic(wwwRoot, { maxAge: hourMs, 'index': false }));

/** Errors */
app.use((req, res, next) => {
    return ReturnFormatError(res, NewError(`Not Found URL: ${req.url}`, 404));
});
app.use((err, req, res, next) => {
    return ReturnFormatError(res, err);
});

/** Listen */
app.listen(port, () => {
    console.log('Servidor Dump Escuchando Puerto '.yellow.bold + "80".yellow.bold);
});

/** Helpers */
function NewError (message, code = 500, data = null) {
    let err = new Error(message);
    err.code = code;
    if (data !== null) err.data = data;
    return err;
};

function ReturnFormatError(res, error) {
    if (!ExcludeErrorsID.includes(error.code)) console.error(error.message);
    if (!error.code || error.code === 500) return res.status(500).json({status: 500, error: 'Server error'});

    let jError = {status: error.code, error: error.message};
    if (error.data) jError['data'] = error.data;

    return res.status(error.code).json(jError);
};