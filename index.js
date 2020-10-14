//https://gist.github.com/zmts/802dc9c3510d79fd40f9dc38a12bccfc
require("dotenv").config();
const express = require('express')
const app = express()

const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(
  cors({
    preflightContinue: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    origin: "*",
    allowedHeaders:
      "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept",
  })
);
app.set("trust proxy", true);
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());

app.use(express.static(`${__dirname}/static`));
const {GetIP}=require("./middelwares/ip")
const { auth,torrent,nickname } = require("./routers");
app.use("/api/authentication", auth);
app.use("/api/torrent",GetIP,torrent)
app.use("/api/nickname",nickname)

app.listen(PORT, () => {
  console.log(`Server run at port: ${PORT}`);
});
