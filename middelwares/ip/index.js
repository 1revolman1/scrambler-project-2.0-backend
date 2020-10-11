function GetIP(req,res,next){
    const ip =  req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket
        ? req.connection.socket.remoteAddress
        : null);
    res.locals.ip=ip;
    next()
}

module.exports={
    GetIP
}