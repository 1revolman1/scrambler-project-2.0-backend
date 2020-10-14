const nickname = require("express").Router();
const axios = require("axios");

const getAllLinks = async (nickname) =>
  new Promise(async (resolve, reject) => {
    let response = await axios.get(
      "https://api.instantusername.com/services/getAll"
    );
    if (response.status === 200) {
      resolve(response.data);
    }
  }).then((data) =>
    data.map(({ service, ...other }) => {
      return {
        ...other,
        service,
        linkToGet: `https://api.instantusername.com/check/${service}/${nickname}`,
      };
    })
  );

const getInfoAboutService = async (data) => {
  return Promise.all(
    data.map(
      async ({ linkToGet }) =>
        new Promise(async (resolve, reject) => {
          let response = await axios.get(linkToGet);
          if (response.status === 200) {
            resolve(response.data);
          }
        })
    )
  ).then((data) => data);
};

nickname.get("/:nick", async (req, res) => {
  await getAllLinks(req.params.nick).then(async (data) => {
    res.json({
      nickname: req.params.nick,
      data: await getInfoAboutService(data),
    });
  });
});
module.exports = { nickname };
