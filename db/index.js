const { createUserSchema } = require("./user");

console.log(process.env.DB_USER,process.env.DB_PASSWORD)
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.o32ry.mongodb.net/scrambleproject?retryWrites=true&w=majority`;

const mongoose = require("mongoose");
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const UserModel = mongoose.model("UserModel", createUserSchema(), "users");

module.exports = {
  mongoose,
  UserModel,
};
