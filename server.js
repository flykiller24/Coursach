const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
var hbs = require("express-handlebars");

var connection = mysql.createConnection({
  host: process.env["INSTRUMENTS_DB_HOST"],
  user: process.env["INSTRUMENTS_DB_USER"],
  password: process.env["INSTRUMENTS_DB_PASS"],
  database: process.env["INSTRUMENTS_DB_NAME"]
});

var app = express();
app.engine("hbs", hbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(
  session({
    secret: process.env["INSTRUMENTS_EXPRESS_SECRET"],
    resave: true,
    saveUninitialized: true
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/login", function(req, res) {
  if (req.session.loggedin) res.redirect("/home");
  else res.render("login", { layout: "main", title: "Login" });
});

app.get("/register", function(req, res) {
  if (req.session.loggedin) res.redirect("/home");
  else res.render("register", { layout: "main", title: "Register" });
});

app.post("/auth", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (username && password) {
    connection.query(
      `SELECT * FROM accounts WHERE username="${username}"`,
      function(err, result, fields) {
        if (err) throw err;
        console.log(result);

        if (
          result.length == 1 &&
          bcrypt.compareSync(password, result[0].password)
        ) {
          req.session.loggedin = true;
          req.session.username = username;
          res.redirect("/home");
        } else {
          res.redirect("/register");
        }

        res.end();
      }
    );
  } else {
    res.redirect("/login");
    res.end();
  }
});

app.post("/reg", function(req, res) {
  var username = mysql.escape(req.body.username);
  if (username && req.body.password) {
    var password = bcrypt.hashSync(req.body.password, 10);

    connection.query(
      `INSERT INTO accounts (\`username\`, \`password\`) VALUES ("${username}", "${password}");`,
      function(err, result) {
        if (err) throw err;
        console.log(`inserted user: ${username}`);
      }
    );
    req.session.loggedin = true;
    req.session.username = username;
    res.redirect("/home");
  } else {
    res.redirect("/register");
    res.end();
  }
});

app.get("/home", function(req, res) {
  var txt;
  if (req.session.loggedin)
    txt = `Welcome back, ${req.session.username}! Logout <a href='/logout'>here</a>`;
  else
    txt =
      "Please <a href='/login'>login</a> or <a href='/register'>register</a> to view this page!";

  res.render("empty", { msg: txt });
});

app.get("/logout", function(req, res) {
  if (req.session.loggedin) {
    req.session.destroy(err => {
      if (err) throw err;
    });
  }
  res.redirect("/");
  res.end();
});

const getComments = (page, cb) => {
  connection.query(
    `SELECT * FROM comments WHERE page="${page}"`,
    (err, results) => {
      if (err) throw err;
      cb(results);
    }
  );
};

const putComment = (page, username, comment, cb) => {
  comment = mysql.escape(comment);
  connection.query(
    `INSERT INTO comments (\`page\`, \`username\`, \`comment\`) VALUES ("${page}", "${username}", "${comment}");`,
    err => {
      if (err) throw err;
      console.log(`inserted comment: ${comment} from user ${username}`);
      cb();
    }
  );
};

app.get("/", (req, res) => {
  const pgName = "index";
  getComments(pgName, comments => {
    res.render(pgName, { comments, pgName, loggedin: req.session.loggedin });
  });
});

app.get("/:fname", (req, res) => {
  var fname = req.params.fname;
  if (fname == "style.css") {
    res.sendFile(path.join(__dirname, "static/style.css"));
  } else if (fname.endsWith(".jpg") || fname.endsWith(".png")) {
    res.sendFile(path.join(__dirname, `img/${fname}`));
  } else if (fname.indexOf(".") == -1) {
    getComments(fname, comments => {
      res.render(fname, {
        comments,
        pgName: fname,
        loggedin: req.session.loggedin
      });
    });
  } else {
    res.render("error404");
  }
});

app.post("/comment_:pgName", (req, res) => {
  const pgName = req.params.pgName;
  putComment(pgName, req.session.username, req.body.comment, () => {
    res.redirect(`/${pgName}`);
  });
});

// site port
app.listen(3000);
