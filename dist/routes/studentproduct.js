"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _School = _interopRequireDefault(require("../models/School"));

var _StudentProduct = _interopRequireDefault(require("../models/StudentProduct"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to get list of purchased student products
// from a particular school


router.get("/:schoolname", _studentAuth.default, async (req, res) => {
  const schoolname = req.params.schoolname;
  const studentId = req.student.id;

  try {
    const school = await _School.default.findOne({
      name: schoolname
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    const studentProducts = await _StudentProduct.default.find({
      student: studentId,
      boughtfrom: school._id
    }).populate({
      path: "productBought",
      model: "Product"
    });
    res.json(studentProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
var _default = router;
exports.default = _default;