const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const app = express();
const routes = require("./routes/index.js");
const port = 3001;

dotenv.config();
console.log("process.env.OPENAI_API_KEY", process.env.OPENAI_API_KEY);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("This is home");
});

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});
