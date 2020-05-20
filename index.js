const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const fileUpload = require("express-fileupload");
const session = require("express-session");

// mongoDB: Connect ----------------------------------
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/nirvrtti", {
  useNewUrlParser: true
});
// mongoDB: Create table Objects ----------------------------------
const Admin = mongoose.model("Admin", {
  username: String,
  password: String
});
const Header = mongoose.model("Header", {
  title: String,
  subtitle: String,
  tagline: String,
  logo: String,
  copyright: String
});
const Main = mongoose.model("Main", {
  title: String,
  subtitle: String,
  summary: String,
  pageimage: String
});
const Page = mongoose.model("Page", {
  title: String,
  subtitle: String,
  slug: String,
  summary: String,
  pageimage: String
});

// Express Setting ----------------------------------
const app = express();

app.use(fileUpload());
app.use(session({
  secret: "secretsecretsecretsecretsecret",
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");



/*
 * ----------------------------------------
 * Routes
 * ----------------------------------------
 */

app.get("/", function(req, res) {
  res.redirect("/main");
});

// Login ----------------------------------
app.get("/admin/login", function(req, res) {
  res.render("login");
});
app.post("/admin/login", function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  Admin.findOne({ username: username, password: password }).exec(function(err, admin) {
    req.session.username = admin.username;
    req.session.userLoggedIn = true;
    res.redirect("/admin");
  });
});
app.get("/admin/logout", function(req, res) {
  req.session.destroy();
  res.render("logout");
});

// Admin - create page ----------------------------------
app.get("/admin/createPage", function(req, res) {
  if (req.session.userLoggedIn) {
    res.render("createPage");
  } else {
    res.redirect("/admin/login");
  }
});
app.post("/admin/createPage", [
  check("title", "Title is required").not().isEmpty(),
  check("slug", "Slug is required").not().isEmpty()
], function(req, res) {
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors.array());
    res.render("createPage", {errors: errors.array()});
  } else {
    let title = req.body.title;
    let subtitle = req.body.subtitle;
    let slug = req.body.slug;
    let summary = req.body.summary;
    let pageimageName;
    if (req.files) {
      pageimageName = req.files.pageimage.name;
      let image = req.files.pageimage;
      let imagePath = "public/images_saved/" + pageimageName;
      image.mv(imagePath, function(err) {
        console.log("Issue of image error", err);
      });
    }
    
    let pageContent = new Page({
      title: title,
      subtitle: subtitle,
      slug: slug,
      summary: summary,
      pageimage: pageimageName
    });
    pageContent.save().then( () => {
      console.log("New main component is created");
    } );
    let page = {
      title: title,
      subtitle: subtitle,
      slug: slug,
      summary: summary,
      pageimage: pageimageName
    };
    res.render("createdPage", page);
  }
});
// Admin - Edit main page ----------------------------------
app.get("/admin/editPageDefault", function(req, res) {
  var id = req.params.id;
  Main.findOne({id: id}).exec(function(err, main) {
    res.render("editPageDefault", {main: main});
  });
});
app.post("/admin/editPageDefault", [
  check("subtitle", "Subtitle is required").not().isEmpty(),
  check("summary", "Summary is required").not().isEmpty()
], function(req, res) {
  var id = req.params.id;
  let errors = validationResult(req);
  
  let title = req.body.title;
  let subtitle = req.body.subtitle;
  let slug = req.body.slug;
  let summary = req.body.summary;
  let pageimageName;
  if (req.files) {
    pageimageName = req.files.pageimage.name;
    let image = req.files.pageimage;
    let imagePath = "public/images_saved/" + pageimageName;
    image.mv(imagePath, function(err) {
      console.log("Issue of image error", err);
    });
  }

  if(!errors.isEmpty()) {
    Main.findOne({id: id}).exec(function(err, main) {
      main.title = title;
      main.subtitle = subtitle;
      main.slug = slug;
      main.summary = summary;
      !req.files 
        ? main.pageimage = main.pageimage 
        : main.pageimage = pageimageName; 
      console.log("errors: ", errors);
      res.render("editPageDefault", {main: main, errors: errors.array()});
    });
  } else {
    Main.findOne({id:id}).exec(function(err, main) {
      main.title = title;
      main.subtitle = subtitle;
      main.slug = slug;
      main.summary = summary;
      !req.files 
        ? main.pageimage = main.pageimage 
        : main.pageimage = pageimageName;  
      main.save().then( () => {
        console.log("Component is updated");
      } );
    });
    res.redirect("/admin");
  }
});
// Admin - Edit header common area ----------------------------------
app.get("/admin/editCommon", function(req, res) {
  var id = req.params.id;
  Header.findOne({id: id}).exec(function(err, header) {
    res.render("editCommon", {header: header});
  });
});
app.post("/admin/editCommon", [
  check("title", "Title is required").not().isEmpty(),
  check("subtitle", "Subtitle is required").not().isEmpty()
], function(req, res) {
  let errors = validationResult(req);
  let id = req.params.id;

  let title = req.body.title;
  let tagline = req.body.tagline;
  let subtitle = req.body.subtitle;
  let copyright = req.body.copyright;
  let pageimageName;

  if (req.files) {
    pageimageName = req.files.logo.name;
    let image = req.files.logo;
    let imagePath = "public/images_saved/" + pageimageName;
    image.mv(imagePath, function(err) {
      console.log("Issue of image error", err);
    });
  }

  if(!errors.isEmpty()) {
    Header.findOne({id: id}).exec(function(err, header) {
      header.title = title;
      header.subtitle = subtitle;
      header.tagline = tagline;
      header.copyright = copyright;
      !req.files 
        ? header.logo = header.logo 
        : header.logo = pageimageName; 
      console.log("errors: ", errors);
      res.render("editCommon", {header: header, errors: errors.array()});
    });
  } else {
    Header.findOne({id:id}).exec(function(err, header) {
      header.title = title;
      header.subtitle = subtitle;
      header.tagline = tagline;
      header.copyright = copyright;
      !req.files 
        ? header.logo = header.logo 
        : header.logo = pageimageName; 
      header.save().then( () => {
        console.log("Component is updated");
      } );
    });
    res.redirect("/admin/common");
  }
});
// Admin - Edit each created page ----------------------------------
app.get("/admin/editPage/:id", function(req, res) {
  let id = req.params.id;
  Page.findOne({_id: id}).exec(function(err, page) {
    res.render("editPage", {page: page});
  });
});
app.post("/admin/editPage/:id", [
  check("title", "title is required").not().isEmpty(),
  check("subtitle", "subtitle is required").not().isEmpty(),
  check("slug", "slug is required").not().isEmpty()
], function(req, res) {
  let id = req.params.id;
  let errors = validationResult(req);

  let title = req.body.title;
  let subtitle = req.body.subtitle;
  let slug = req.body.slug;
  let summary = req.body.summary;
  let pageimageName;

  if (req.files) {
    pageimageName = req.files.pageimage.name;
    let image = req.files.pageimage;
    let imagePath = "public/images_saved/" + pageimageName;
    image.mv(imagePath, function(err) {
      console.log("Issue of image error", err);
    });
  } else {
    console.log("--- no images is selected ---");
  }

  if(!errors.isEmpty()) {
    Page.findOne({_id: id}).exec(function(err, page) {
      page.title = title;
      page.subtitle = subtitle;
      page.slug = slug;
      page.summary = summary;
      !req.files 
        ? page.pageimage = page.pageimage 
        : page.pageimage = pageimageName; 
      console.log("errors: ", errors);
      res.render("editPage", { page: page, errors: errors.array()});
    });
  } else {
    Page.findOne({_id:id}).exec(function(err, page) {
      page.title = title;
      page.subtitle = subtitle;
      page.slug = slug;
      page.summary = summary;
      !req.files 
        ? page.pageimage = page.pageimage 
        : page.pageimage = pageimageName;   
      page.save().then( () => {
        console.log("Page is updated");
      } );
    });
    res.redirect("/admin");
  }
});
// Admin - Delete the page ----------------------------------
app.get("/admin/deletePage/:id", function(req, res) {
  let id = req.params.id;
  if (req.session.userLoggedIn) {
    Page.findByIdAndRemove({_id: id}).exec(function(err, page) {
      res.render("deletePage");
    });
  } else {
    res.redirect("/admin/login");
  }
});



// Admin list ----------------------------------
app.get("/admin", function(req, res) {
  if (req.session.userLoggedIn) {
    Page.find({}).exec(function(err, pages) {
      res.render("adminPage", {pages: pages});
    });
  } else {
    res.redirect("/admin/login");
  }
});
app.get("/admin/common", function(req, res) {
  if (req.session.userLoggedIn) {
    Page.find({}).exec(function(err, pages) {
      res.render("adminCommon", {pages: pages});
    });
  } else {
    res.redirect("/admin/login");
  }
});
app.get("/admin/design", function(req, res) {
  if (req.session.userLoggedIn) {
    res.render("adminDesign");
  } else {
    res.redirect("/admin/login");
  }
});
app.get("/admin/setting", function(req, res) {
  if (req.session.userLoggedIn) {
    res.render("adminSetting");
  } else {
    res.redirect("/admin/login");
  }
});



// Front ----------------------------------
app.get("/main", function(req, res) {
  var id = req.params.id;
  Page.find({}).exec(function(err, pages) {
    Main.findOne({id:id}).exec(function(err, main) {
      Header.findOne({id:id}).exec(function(err, header) {
        res.render("pageDefault", {
          pages: pages,
          main: main,
          header:header,
        });
      });
    });
  });
});
app.get("/main/:slug", function(req, res) {
  var id = req.params.id;
  var slug = req.params.slug;
  Page.find({}).exec(function(err, pages) {
    Page.findOne({slug: slug}).exec(function(err, page) {
      Header.findOne({id:id}).exec(function(err, header) {
        res.render("page", {
          pages: pages, 
          page: page,
          header:header,
        });
      });
    });
  });
});



/*
 * ----------------------------------------
 * Start server
 * ----------------------------------------
 */

app.listen(8080);
console.log("Local-server has started at 8080 for site");