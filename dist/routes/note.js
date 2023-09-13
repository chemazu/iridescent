"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _Note = _interopRequireDefault(require("../models/Note"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post('/:courseUnitId', _studentAuth.default, [(0, _expressValidator.body)('text', 'note text cannot be empty').not().isEmpty(), (0, _expressValidator.body)('timestamp', 'note timestamp cannot be empty').not().isEmpty()], async (req, res) => {
  const courseUnitId = req.params.courseUnitId;
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {
    const courseUnit = await _CourseUnit.default.findOne({
      _id: courseUnitId
    });

    if (!courseUnit) {
      return res.json({
        errors: [{
          msg: "course unit not found"
        }]
      });
    }

    const noteObj = {
      text: req.body.text,
      timestamp: req.body.timestamp,
      createdby: req.student.id,
      courseunit: courseUnit._id
    };
    const newNote = new _Note.default(noteObj);
    await newNote.save();
    res.json(newNote);
  } catch (error) {
    res.status(500).send("server error");
  }
}); // course unit ID

router.get('/:courseUnitId', _studentAuth.default, async (req, res) => {
  try {
    const courseUnitId = req.params.courseUnitId;
    const notes = await _Note.default.find({
      courseunit: courseUnitId,
      createdby: req.student.id
    });
    res.json(notes);
  } catch (error) {
    res.status(500).send("server error");
  }
});
router.delete('/:courseUnitId/:noteId', _studentAuth.default, async (req, res) => {
  const courseUnitId = req.params.courseUnitId;
  const noteId = req.params.noteId;

  try {
    const note = await _Note.default.findOne({
      _id: noteId,
      courseunit: courseUnitId
    });
    note.remove();
    res.json(note);
  } catch (error) {
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;