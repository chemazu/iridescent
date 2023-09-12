"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const connectDB = () => {
  _mongoose.default.connect("mongodb+srv://kolniy:Kolniysoft10@developershangout.kv8uf.mongodb.net/tutorly?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }).then(() => console.log("Database connected succesfully")).catch(err => {
    console.log(err);
  });
};

var _default = connectDB;
exports.default = _default;