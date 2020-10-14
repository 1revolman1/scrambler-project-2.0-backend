function GetIP(req, res, next) {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
  res.locals.ip = ip;
  if (!JSON.parse(process.env.DEV.toLowerCase()) && ip === "::1") {
    res.status(404);
    res.json({ error: true });
  } else next();
}

module.exports = {
  GetIP,
};
