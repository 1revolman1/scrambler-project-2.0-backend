const torrent = require("express").Router();
const cheerio = require("cheerio");
const axios = require("axios");
const iplocate = require("node-iplocate");
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
      id: element.children[0].attribs.href.split("=")[1]
    });
  });
  return data;
};
const getTorrents = (ip) =>
  new Promise(async (resolve, reject) => {
    let response = await axios.get(
      `https://iknowwhatyoudownload.com/ru/peer/?ip=${ip}`
    );
    if (response.status === 200) {
      let torrent_info = await parseData(response.data);
      let information = { content: torrent_info };
      torrent_info.forEach(({ type }) => {
        if (type === "Порно")
          information = { ...information, hasPornography: true };
        if (type === "Детское порно")
          information = { ...information, hasChildPornography: true };
      });
      resolve(information);
    }else{
        reject(response.status)
    }
  });
const ipLocate = (ip) =>
  new Promise(async (resolve, reject) => {
    let results = await iplocate(ip);
    if (results !== null) {
      let { ip, country, org, city, latitude, longitude } = results;
      let information = {
        ip,
        internetProvider: org,
        hasPornography: false,
        hasChildPornography: false,
        geo: {
          country,
          city,
          latitude,
          longitude,
        },
      };
      resolve(information);
    }else{
        reject(results)
    }
  });
const getTorrentData = async function (ip) {
  return Promise.all([getTorrents(ip), ipLocate(ip)]).then(
    ([torrent, locate]) => {
      return { ...locate, ...torrent };
    }
  );
};

const getFilms=(id)=> new Promise(async (resolve, reject) => {
    let response = await axios.get(
      `https://iknowwhatyoudownload.com/ru/torrent/?id=${id}`
    );
    if (response.status === 200) {
      let torrent_info = await parseFilmData(response.data);
      resolve(torrent_info);
    }else{
      reject(response.status)
    }
  });
const getFilmsData=async(id)=>Promise.all([getFilms(id)]).then(
    ([data]) => {
      return data;
    }
  );
const parseFilmData = async function (html) {
  const $ = cheerio.load(html);
  let data = $(".panel-info .media-body .table tbody tr").map(function(index, element) {
    const first=  $(element).find("td").eq(0).text();
    const second=  $(element).find("td").eq(1).text();
    return {
      first,
      second
    }
  }).get();
  return {
    photo:$(".poster-thumb").attr("src"),
    data
  };
};

torrent.get("/", async (req, res) => {
  res.json(await getTorrentData(res.locals.ip));
});

torrent.get("/film/:id", async (req, res) => {
  if(req.params.id.length!=96){
    res.status(406);
    res.json({error:true})
  }else{
    const data=await(getFilmsData(req.params.id));
    if(data && data.data && data.data.length>0)
      res.json(data)
    else{
      res.status(404);
      res.json({error:true})
    }
  }
  
});
torrent.get("/:ip", async (req, res) => {
  if(new RegExp('^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$').test(req.params.ip)){
  res.json(await getTorrentData(req.params.ip));
  }else{
    res.status(404);
    res.json({error:true})
  }
});
module.exports = { torrent };
