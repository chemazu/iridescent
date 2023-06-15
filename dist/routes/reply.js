"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _User = _interopRequireDefault(require("../models/User"));

var _Student = _interopRequireDefault(require("../models/Student"));

var _CourseUnit = _interopRequireDefault(require("../models/CourseUnit"));

var _Comment = _interopRequireDefault(require("../models/Comment"));

var _Notifications = _interopRequireDefault(require("../models/Notifications"));

var _StudentNotification = _interopRequireDefault(require("../models/StudentNotification"));

var _Reply = _interopRequireDefault(require("../models/Reply"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _studentAuth = _interopRequireDefault(require("../middleware/studentAuth"));

var _tutuor = require("../emails/notifications/tutuor");

var _student = require("../emails/notifications/student");

var _preProcessCommentOrReplyText = _interopRequireDefault(require("../utilities/preProcessCommentOrReplyText"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // const getUserByUsername = async (username) => {
//   try {
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("server error");
//   }
// }
// const getStudentByUsername = async (username) => {
//   try {
//   } catch (error) {
//       console.error(error);
//       res.status(500).send("server error");
//   }
// }


router.post("/:commentId/:courseunitId/:coursechapterId", _auth.default, _studentAuth.default, (0, _expressValidator.body)("text", "reply text required").not().isEmpty(), async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    text,
    schoolname
  } = req.body;

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

    const commentOwner = await _Student.default.findOne({
      username: comment.username
    });

    if (req.user) {
      // if condition checks if it's a student or an author making the request
      const user = await _User.default.findOne({
        _id: req.user.id
      });
      const reply = new _Reply.default({
        username: user.username,
        text: text,
        comment: comment._id,
        courseunit: req.params.courseunitId,
        coursechapter: req.params.coursechapterId,
        replyavatar: user.avatar,
        replyby: req.user.id
      });
      comment.reply.push(reply._id); // code to check if there are any mentions
      // then let mentions be notified of authors reply
      // and algorithm to notify commenter of the new reply

      const mentions = (0, _preProcessCommentOrReplyText.default)(reply.text);

      if (mentions.length > 0) {
        mentions.forEach(async mention => {
          const validStudent = await _Student.default.findOne({
            username: new RegExp("^" + mention + "$", "i")
          });

          if (validStudent) {
            if (validStudent.email !== commentOwner.email) {
              // only send mail if the user is not the same as the commentor
              // since commentors recieve their own mails ...
              // send mail to the student
              const newStudentNotification = new _StudentNotification.default({
                student: validStudent._id,
                message: `${reply.username} mentioned you in a reply.`,
                title: `${reply.username}`,
                type: "reply added",
                courseunitid: req.params.courseunitId,
                commentid: comment._id,
                replyid: reply._id,
                coursechapterid: req.params.coursechapterId
              });
              newStudentNotification.save();
              (0, _student.sendReplyMentionStudentNotification)(validStudent.email, reply.username, reply.text, reply.courseunit, reply.comment, reply.coursechapter, reply._id, schoolname);
            }
          }
        });
      }

      const newStudentNotification = new _StudentNotification.default({
        student: commentOwner._id,
        message: `${reply.username} added a reply to your comment.`,
        title: `${reply.username}`,
        type: "reply added",
        courseunitid: req.params.courseunitId,
        commentid: comment._id,
        replyid: reply._id,
        coursechapterid: req.params.coursechapterId
      });
      newStudentNotification.save();
      (0, _student.replyToCommentAdded)(commentOwner.email, reply.username, reply.text, reply.courseunit, reply.comment, reply.coursechapter, reply._id, schoolname);
      await reply.save();
      await comment.save();
      res.json(reply);
    } else {
      const student = await _Student.default.findOne({
        _id: req.student.id
      });
      const reply = new _Reply.default({
        username: student.username,
        text: text,
        comment: comment._id,
        replyavatar: student.avatar,
        courseunit: req.params.courseunitId,
        coursechapter: req.params.coursechapterId,
        replyby: req.student.id
      }); // code to notify course author of a new reply //

      const courseUnitItem = await _CourseUnit.default.findOne({
        _id: reply.courseunit // first find course author by unit

      }).populate("course", ["author"]);
      const author = await _User.default.findOne({
        _id: courseUnitItem.course.author // then use unit to find the course author

      });
      const commentOwner = await _Student.default.findOne({
        username: comment.username
      });
      const newNotification = new _Notifications.default({
        user: author._id,
        // save a notification for the author
        message: `${reply.username} added a replied a reply`,
        title: `${reply.username}`,
        type: "reply added",
        courseunitid: req.params.courseunitId,
        commentid: comment._id,
        replyid: reply._id,
        coursechapterid: req.params.coursechapterId
      });
      await newNotification.save(); // send an email notification to the author on the new reply

      await (0, _tutuor.studentSentReplyToComment)(author.email, reply.username, reply.text, reply.courseunit, reply.comment, reply.coursechapter, reply._id); // algorithm to handle email notification to student who made the comment that was replied too

      if (comment.username !== reply.username) {
        // only send the email if the reply is not the comment
        // owner
        const newStudentNotification = new _StudentNotification.default({
          student: commentOwner._id,
          message: `${reply.username} added a reply to your comment.`,
          title: `${reply.username}`,
          type: "reply added",
          courseunitid: req.params.courseunitId,
          commentid: comment._id,
          replyid: reply._id,
          coursechapterid: req.params.coursechapterId
        });
        newStudentNotification.save();
        (0, _student.replyToCommentAdded)(commentOwner.email, reply.username, reply.text, reply.courseunit, reply.comment, reply.coursechapter, reply._id);
      } // and also handle mentions in the reply text


      const mentions = (0, _preProcessCommentOrReplyText.default)(reply.text);

      if (mentions.length > 0) {
        mentions.forEach(async mention => {
          const validStudent = await _Student.default.findOne({
            username: new RegExp("^" + mention + "$", "i")
          });

          if (validStudent) {
            if (validStudent.email !== commentOwner.email) {
              // only send mail if the user is not the same as the commentor
              // since commentors recieve their own mails seperately
              // send mail to the student
              const newStudentNotification = new _StudentNotification.default({
                student: validStudent._id,
                message: `${reply.username} mentioned you in a reply.`,
                title: `${reply.username}`,
                type: "reply added",
                courseunitid: req.params.courseunitId,
                commentid: comment._id,
                replyid: reply._id,
                coursechapterid: req.params.coursechapterId
              });
              newStudentNotification.save();
              (0, _student.sendReplyMentionStudentNotification)(validStudent.email, reply.username, reply.text, reply.courseunit, reply.comment, reply.coursechapter, reply._id, schoolname);
            } // send mail to student

          }
        });
      }

      comment.reply.push(reply._id);
      await reply.save();
      await comment.save();
      res.json(reply);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
router.get("/:commentId", _auth.default, async (req, res) => {
  const {
    page,
    size
  } = req.query;
  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;

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

    const replies = await _Reply.default.paginate({
      comment: comment._id
    }, {
      offset: skip,
      limit: limit
    });
    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
router.delete("/:replyId", _auth.default, _studentAuth.default, async (req, res) => {
  try {
    const reply = await _Reply.default.findOne({
      _id: req.params.replyId
    });

    if (!reply) {
      return res.status(400).json({
        errors: [{
          msg: "reply not found"
        }]
      });
    }

    await reply.remove();
    res.json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});
var _default = router;
exports.default = _default;