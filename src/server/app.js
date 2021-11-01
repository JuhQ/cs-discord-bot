require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const discordAuthRoute = require("./routes/discordAuth");
const discordJoinRoute = require("./routes/join");
const facultyAuthRoute = require("./routes/authenticateFaculty");
const metricsRoute = require("./routes/metrics");
const defaultRouteHandler = require("./routes/defaultRouteHandler");
const defaultRouteErrorHandler = require("./routes/defaultRouteErrorHandler");
require("./strategies/discordstrategy");

const SequelizeStore = require("connect-session-sequelize")(session.Store);

module.exports = (sequelize) => {
  const app = express();
  var store = new SequelizeStore({
    db: sequelize,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: store,
      saveUninitialized: false,
      resave: false,
    }));

  store.sync();

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/", defaultRouteHandler);
  app.use("/discordAuth", discordAuthRoute);
  app.use("/join", discordJoinRoute);
  app.use("/authenticate_faculty", facultyAuthRoute);
  app.use("/metrics", metricsRoute);
  app.use("*", defaultRouteErrorHandler);

  return app;
};
