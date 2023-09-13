import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import Student from "../models/Student";
import Notification from "../models/Notifications";
import StudentNotification from "../models/StudentNotification";
import CourseUnit from "../models/CourseUnit";
import Comment from "../models/Comment";
import Reply from "../models/Reply";
import auth from "../middleware/auth";
import studentAuth from "../middleware/studentAuth";
import { studentAddedNewComment } from "../emails/notifications/tutuor";
import { sendCommentMentionStudentNotification } from "../emails/notifications/student";
import preProcessCommentOrReplyText from "../utilities/preProcessCommentOrReplyText";

const router = express.Router();

router.post(
  "/:courseunitId/:coursechapterId",
  auth,
  studentAuth,
  body("text", "comment text required").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { text, commentuserid, schoolname } = req.body;

    try {
      let courseunit = await CourseUnit.findOne({
        _id: req.params.courseunitId,
      });

      if (!courseunit) {
        return res.status(400).json({
          errors: [
            {
              msg: "courseunit not found",
            },
          ],
        });
      }

      const student = await Student.findOne({
        _id: req.student.id,
      });

      let { username, avatar, email } = student;

      const comment = new Comment({
        username: username,
        text: text,
        courseunit: req.params.courseunitId,
        coursechapter: req.params.coursechapterId,
        commentavatar: avatar,
        commentby: commentuserid,
      });

      courseunit.comments.push(comment._id);

      const courseUnit = await CourseUnit.findOne({
        _id: comment.courseunit,
      }).populate("course", ["author"]);

      const author = await User.findOne({
        _id: courseUnit.course.author,
      });

      const newNotification = new Notification({
        user: author._id,
        message: `${comment.username} added a comment to a course unit`,
        title: `${comment.username}`,
        type: "comment added",
        courseunitid: req.params.courseunitId,
        commentid: comment._id,
        coursechapterid: req.params.coursechapterId,
      });

      // send email notification of new added comment
      studentAddedNewComment(
        author.email,
        comment.username,
        comment.text,
        courseUnit._id,
        comment._id,
        comment.coursechapter
      );

      // code to check if there are any mentions
      // then let mentions be notified of authors reply
      // and algorithm to notify commenter of the new reply
      const mentions = preProcessCommentOrReplyText(comment.text);
      if (mentions.length > 0) {
        mentions.forEach(async (mention) => {
          const validStudent = await Student.findOne({
            username: new RegExp("^" + mention + "$", "i"),
          });
          if (validStudent) {
            if (validStudent.email !== email) {
              // only send mail if the user is not the same as the commentor
              // since commentors recieve their own mails ...
              // send mail to the student

              const newStudentNotification = new StudentNotification({
                student: validStudent._id,
                message: `${comment.username} mentioned you in a comment`,
                title: `${comment.username}`,
                type: "comment added",
                courseunitid: req.params.courseunitId,
                commentid: comment._id,
                coursechapterid: req.params.coursechapterId,
              });

              newStudentNotification.save();

              sendCommentMentionStudentNotification(
                validStudent.email,
                comment.username,
                comment.text,
                comment.courseunit,
                comment.comment,
                comment.coursechapter,
                comment._id,
                schoolname
              );
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
  }
);

router.get("/:courseunitId", auth, studentAuth, async (req, res) => {
  const { page, size } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;

  try {
    const courseunit = await CourseUnit.findOne({
      _id: req.params.courseunitId,
    });
    if (!courseunit) {
      return res.status(400).json({
        errors: [
          {
            msg: "courseunit not found",
          },
        ],
      });
    }

    const commentDetails = await Comment.paginate(
      {
        courseunit: req.params.courseunitId,
      },
      {
        offset: skip,
        limit: limit,
        populate: "reply",
        sort: { createdAt: -1 },
      }
    );
    res.json(commentDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

// route to get one comment by commentId
router.get("/single/:commentId", auth, studentAuth, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findOne({
      _id: commentId,
    }).populate("reply");
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

// route to update comment ID
router.put(
  "/:commentId",
  auth,
  studentAuth,
  body("text", "comment text required").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { text } = req.body;
    try {
      let comment = await Comment.findOne({
        _id: req.params.commentId,
      });

      if (!comment) {
        return res.status(400).json({
          errors: [
            {
              msg: "comment not found",
            },
          ],
        });
      }

      comment.text = text;
      await comment.save();
      res.json(comment);
    } catch (error) {
      console.error(error);
      res.status(500).send("server error");
    }
  }
);

router.delete("/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
    });

    if (!comment) {
      return res.status(400).json({
        errors: [
          {
            msg: "comment not found",
          },
        ],
      });
    }

    await Reply.deleteMany({
      comment: comment._id,
    });

    await comment.remove();
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

export default router;
