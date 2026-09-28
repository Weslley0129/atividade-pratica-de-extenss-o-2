const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api", routes);

// Precisam ser os últimos dois middlewares, nesta ordem.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
