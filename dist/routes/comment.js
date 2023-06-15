"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _User = _interopRequireDefault(require("../models/User"));

var _Student = _interopRequireDefault(require("../models/Student"));

var _Notifications = _interopRequireDefault(require("../models/Notifications"));

var _StudentNotification = _interopRequireDefault(require("../models/StudentNotification"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _Comment = _interopRequireDefault(require("../models/Comment"));

var _Reply = _interopRequireDefault(require("../models/Reply"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _tutuor = require("../emails/notifications/tutuor");

var _student = require("../emails/notifications/student");

var _preProcessCommentOrReplyText = _interopRequireDefault(require("../utilities/preProcessCommentOrReplyText"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

router.post("/:courseunitId/:coursechapterId", _auth.default, _studentAuth.default, (0, _expressValidator.body)("text", "comment text required").not().isEmpty(), async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    text,
    commentuserid,
    schoolname
  } = req.body;

  try {
    let courseunit = await _CourseUnit.default.findOne({
      _id: req.params.courseunitId
    });

    if (!courseunit) {
      return res.status(400).json({
        errors: [{
          msg: "courseunit not found"
        }]
      });
    }

    const student = await _Student.default.findOne({
      _id: req.student.id
    });
    let {
      username,
      avatar,
      email
    } = student;
    const comment = new _Comment.default({
      username: username,
      text: text,
      courseunit: req.params.courseunitId,
      coursechapter: req.params.coursechapterId,
      commentavatar: avatar,
      commentby: commentuserid
    });
    courseunit.comments.push(comment._id);
    const courseUnit = await _CourseUnit.default.findOne({
      _id: comment.courseunit
    }).populate("course", ["author"]);
    const author = await _User.default.findOne({
      _id: courseUnit.course.author
    });
    const newNotification = new _Notifications.default({
      user: author._id,
      message: `${comment.username} added a comment to a course unit`,
      title: `${comment.username}`,
      type: "comment added",
      courseunitid: req.params.courseunitId,
      commentid: comment._id,
      coursechapterid: req.params.coursechapterId
    }); // send email notification of new added comment

    (0, _tutuor.studentAddedNewComment)(author.email, comment.username, comment.text, courseUnit._id, comment._id, comment.coursechapter); // code to check if there are any mentions
    // then let mentions be notified of authors reply
    // and algorithm to notify commenter of the new reply

    const mentions = (0, _preProcessCommentOrReplyText.default)(comment.text);

    if (mentions.length > 0) {
      mentions.forEach(async mention => {
        const validStudent = await _Student.default.findOne({
          username: new RegExp("^" + mention + "$", "i")
        });

        if (validStudent) {
          if (validStudent.email !== email) {
            // only send mail if the user is not the same as the commentor
            // since commentors recieve their own mails ...
            // send mail to the student
            const newStudentNotification = new _StudentNotification.default({
              student: validStudent._id,
              message: `${comment.username} mentioned you in a comment`,
              title: `${comment.username}`,
              type: "comment added",
              courseunitid: req.params.courseunitId,
              commentid: comment._id,
              coursechapterid: req.params.coursechapterId
            });
            newStudentNotification.save();
            (0, _student.sendCommentMentionStudentNotification)(validStudent.email, comment.username, comment.text, comment.courseunit, comment.comment, comment.coursechapter, comment._id, schoolname);
          }
        }
      });
    }

    await newNotification.save();
    await comment.save();
    await courseunit.save();
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
router.get("/:courseunitId", _auth.default, _studentAuth.default, async (req, res) => {
  const {
    page,
    size
  } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;

  try {
    const courseunit = await _CourseUnit.default.findOne({
      _id: req.params.courseunitId
    });

    if (!courseunit) {
      return res.status(400).json({
        errors: [{
          msg: "courseunit not found"
        }]
      });
    }

    const commentDetails = await _Comment.default.paginate({
      courseunit: req.params.courseunitId
    }, {
      offset: skip,
      limit: limit,
      populate: "reply",
      sort: {
        createdAt: -1
      }
    });
    res.json(commentDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
}); // route to get one comment by commentId

router.get("/single/:commentId", _auth.default, _studentAuth.default, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await _Comment.default.findOne({
      _id: commentId
    }).populate("reply");
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
}); // route to update comment ID

router.put("/:commentId", _auth.default, _studentAuth.default, (0, _expressValidator.body)("text", "comment text required").not().isEmpty(), async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    text
  } = req.body;

  try {
    let comment = await _Comment.default.findOne({
      _id: req.params.commentId
    });

    if (!comment) {
      return res.status(400).json({
        errors: [{
          msg: "comment not found"
        }]
      });
    }

    comment.text = text;
    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
router.delete("/:commentId", _auth.default, async (req, res) => {
  try {
    const comment = await _Comment.default.findOne({
      _id: req.params.commentId
    });

    if (!comment) {
      return res.status(400).json({
        errors: [{
          msg: "comment not found"
        }]
      });
    }

    await _Reply.default.deleteMany({
      comment: comment._id
    });
    await comment.remove();
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;