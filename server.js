const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
var exphbs  = require('express-handlebars');

var connection = mysql.createConnection({
  host: process.env["INSTRUMENTS_DB_HOST"],
  user: process.env["INSTRUMENTS_DB_USER"],
  password: process.env["INSTRUMENTS_DB_PASS"],
  database: process.env["INSTRUMENTS_DB_NAME"]
});

var app = express();
app.engine('hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs');

app.use(
  session({
    secret: process.env["INSTRUMENTS_EXPRESS_SECRET"],
    resave: true,
    saveUninitialized: true
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/login", function(request, response) {
  if (request.session.loggedin) response.redirect("/home");

  response.sendFile(path.join(__dirname, "templates/login.html"));
});

app.get("/register", function(request, response) {
  if (request.session.loggedin) response.redirect("/home");

  response.sendFile(path.join(__dirname, "templates/register.html"));
});

app.post("/auth", function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    connection.query(
      `SELECT * FROM accounts WHERE username="${username}"`,
      function(err, result, fields) {
        if (err) throw err;
        console.log(result);

        if (result.length == 1 && bcrypt.compareSync(password, result[0].password)) {
            request.session.loggedin = true;
            request.session.username = username;
            response.redirect("/home");
        } else if (result.length > 1) {
          response.send("Internal error");
        } else {
          response.send("Incorrect Username and/or Password!");
        }

        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

app.post("/reg", function(request, response) {
  var username = request.body.username;
  if (username && request.body.password) {
    var password = bcrypt.hashSync(request.body.password, 10);

    connection.query(
      `INSERT INTO accounts (\`username\`, \`password\`) VALUES ("${username}", "${password}");`,
      function(err, result) {
        if (err) throw err;
        console.log(`inserted user: ${username}`);
      }
    );
    request.session.loggedin = true;
    request.session.username = username;
    response.redirect("/home");
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

app.get("/home", function(request, response) {
  var txt;
  if (request.session.loggedin) txt = `Welcome back, ${request.session.username}! Logout <a href='/logout'>here</a>`;
  else txt = "Please <a href='/login'>login</a> or <a href='/register'>register</a> to view this page!";

  response.render('main', { msg : txt });
});

app.get("/logout", function(request, response) {
  if (request.session.loggedin) {
    request.session.destroy(err => {
      if (err) throw err;
    });
  }
  response.redirect("/");
  response.end();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, `templates/index.html`));
});

app.get("/:fname", (req, res) => {
  var fname = req.params.fname;
  if (fname == "style.css") {
    res.sendFile(path.join(__dirname, "templates/style.css"));
  } else if (fname.endsWith(".jpg") || fname.endsWith(".png")) {
    res.sendFile(path.join(__dirname, `img/${fname}`));
  } else if (fname.indexOf(".") == -1) {
    res.sendFile(path.join(__dirname, `templates/${fname}.html`));
  } else {
    res.send("Error, no such file");
  }
});

// site port
app.listen(3000);
