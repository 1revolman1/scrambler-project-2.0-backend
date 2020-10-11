const torrent = require("express").Router();
const cheerio = require("cheerio");
const axios = require("axios");
const { JWTlAuthMiddleware } = require("../auth");

const parseData = async function (html) {
  data = [];
  const $ = cheerio.load(html);
  $(".table tbody .torrent_files").each((index, element) => {
    let last = $(`.table tbody .date-column`)
      .eq(index + index + 1)
      .text();
    data.push({
      name: $(`.table tbody .torrent_files`)
        .eq(index)
        .text()
        .replace(/\s+/g, " "),
      size: $(`.table tbody .size-column`).eq(index).text(),
      lastData: last,
      type: $(`.table tbody .category-column`).eq(index).text(),
    });
  });
  return data;
};
const getData = async function (ip) {
  let information = {};
  information.creationDate = new Date().toLocaleDateString();
  let {
    status,
    data: { query, org, country, city, lat, lon },
  } = await axios.get(`http://ip-api.com/json/${ip}`);
  if (status === 200) {
    information = {
      ...information,
      ip: query,
      internetProvider: org,
      hasPornography: false,
      hasChildPornography: false,
      geo: {
        country,
        city,
        lat,
        lon,
      },
    };
  }
  let response = await axios.get(
    `https://iknowwhatyoudownload.com/ru/peer/?ip=${ip}`
  );
  if (response.status === 200) {
    let torrent_info = this.parseData(response.data);
    information.content = torrent_info;
    for (let i = 0; i < information.content.length; i++) {
      if (information.content[i].type == "Порно")
        information.hasPornography = true;
      if (information.content[i].type == "Детское порно")
        information.hasChildPornography = true;
    }
  }
  return information;
};

torrent.get("/", async (req, res) => {
  res.json({
    ip: res.locals.ip,
    data: "HELLO",
  });
});
torrent.get("/:ip", async (req, res) => {
  res.json({
    data: await getData(req.params.ip),
    ipDATA: req.params.ip,
    ip: res.locals.ip,
  });
});
module.exports = { torrent };
