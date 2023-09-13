"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _Visit = _interopRequireDefault(require("../models/Visit"));

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/create", _auth.default, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = (0, _moment.default)().startOf("day");
    const existingVisit = await _Visit.default.findOne({
      user: userId,
      date: {
        $gte: today.toDate(),
        $lte: (0, _moment.default)(today).endOf("day").toDate()
      }
    });

    if (existingVisit) {
      res.json("Visit already logged today");
    } else {
      const newVisit = new _Visit.default({
        user: userId
      });
      await newVisit.save();
      res.json("Visit logged successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({
      error: "error"
    });
  }
});
var _default = router;
exports.default = _default;