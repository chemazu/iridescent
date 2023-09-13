import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import Student from "../models/Student";
import CourseUnit from "../models/CourseUnit";
import Comment from "../models/Comment";
import Notification from "../models/Notifications";
import StudentNotification from "../models/StudentNotification";
import Reply from "../models/Reply";
import auth from "../middleware/auth";
import studentAuth from "../middleware/studentAuth";
import { studentSentReplyToComment } from "../emails/notifications/tutuor";
import {
  replyToCommentAdded,
  sendReplyMentionStudentNotification,
} from "../emails/notifications/student";
import preProcessCommentOrReplyText from "../utilities/preProcessCommentOrReplyText";

const router = express.Router();

// const getUserByUsername = async (username) => {
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

router.post(
  "/:commentId/:courseunitId/:coursechapterId",
  auth,
  studentAuth,
  body("text", "reply text required").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { text, schoolname } = req.body;

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

      const commentOwner = await Student.findOne({
        username: comment.username,
      });

      if (req.user) {
        // if condition checks if it's a student or an author making the request
        const user = await User.findOne({
          _id: req.user.id,
        });

        const reply = new Reply({
          username: user.username,
          text: text,
          comment: comment._id,
          courseunit: req.params.courseunitId,
          coursechapter: req.params.coursechapterId,
          replyavatar: user.avatar,
          replyby: req.user.id,
        });

        comment.reply.push(reply._id);

        // code to check if there are any mentions
        // then let mentions be notified of authors reply
        // and algorithm to notify commenter of the new reply
        const mentions = preProcessCommentOrReplyText(reply.text);
        if (mentions.length > 0) {
          mentions.forEach(async (mention) => {
            const validStudent = await Student.findOne({
              username: new RegExp("^" + mention + "$", "i"),
            });
            if (validStudent) {
              if (validStudent.email !== commentOwner.email) {
                // only send mail if the user is not the same as the commentor
                // since commentors recieve their own mails ...
                // send mail to the student
                const newStudentNotification = new StudentNotification({
                  student: validStudent._id,
                  message: `${reply.username} mentioned you in a reply.`,
                  title: `${reply.username}`,
                  type: "reply added",
                  courseunitid: req.params.courseunitId,
                  commentid: comment._id,
                  replyid: reply._id,
                  coursechapterid: req.params.coursechapterId,
                });

                newStudentNotification.save();

                sendReplyMentionStudentNotification(
                  validStudent.email,
                  reply.username,
                  reply.text,
                  reply.courseunit,
                  reply.comment,
                  reply.coursechapter,
                  reply._id,
                  schoolname
                );
              }
            }
          });
        }

        const newStudentNotification = new StudentNotification({
          student: commentOwner._id,
          message: `${reply.username} added a reply to your comment.`,
          title: `${reply.username}`,
          type: "reply added",
          courseunitid: req.params.courseunitId,
          commentid: comment._id,
          replyid: reply._id,
          coursechapterid: req.params.coursechapterId,
        });

        newStudentNotification.save();

        replyToCommentAdded(
          commentOwner.email,
          reply.username,
          reply.text,
          reply.courseunit,
          reply.comment,
          reply.coursechapter,
          reply._id,
          schoolname
        );

        await reply.save();
        await comment.save();

        res.json(reply);
      } else {
        const student = await Student.findOne({
          _id: req.student.id,
        });

        const reply = new Reply({
          username: student.username,
          text: text,
          comment: comment._id,
          replyavatar: student.avatar,
          courseunit: req.params.courseunitId,
          coursechapter: req.params.coursechapterId,
          replyby: req.student.id,
        });

        // code to notify course author of a new reply //
        const courseUnitItem = await CourseUnit.findOne({
          _id: reply.courseunit, // first find course author by unit
        }).populate("course", ["author"]);

        const author = await User.findOne({
          _id: courseUnitItem.course.author, // then use unit to find the course author
        });

        const commentOwner = await Student.findOne({
          username: comment.username,
        });

        const newNotification = new Notification({
          user: author._id, // save a notification for the author
          message: `${reply.username} added a replied a reply`,
          title: `${reply.username}`,
          type: "reply added",
          courseunitid: req.params.courseunitId,
          commentid: comment._id,
          replyid: reply._id,
          coursechapterid: req.params.coursechapterId,
        });

        await newNotification.save();
        // send an email notification to the author on the new reply
        await studentSentReplyToComment(
          author.email,
          reply.username,
          reply.text,
          reply.courseunit,
          reply.comment,
          reply.coursechapter,
          reply._id
        );

        // algorithm to handle email notification to student who made the comment that was replied too
        if (comment.username !== reply.username) {
          // only send the email if the reply is not the comment
          // owner

          const newStudentNotification = new StudentNotification({
            student: commentOwner._id,
            message: `${reply.username} added a reply to your comment.`,
            title: `${reply.username}`,
            type: "reply added",
            courseunitid: req.params.courseunitId,
            commentid: comment._id,
            replyid: reply._id,
            coursechapterid: req.params.coursechapterId,
          });

          newStudentNotification.save();

          replyToCommentAdded(
            commentOwner.email,
            reply.username,
            reply.text,
            reply.courseunit,
            reply.comment,
            reply.coursechapter,
            reply._id
          );
        }

        // and also handle mentions in the reply text
        const mentions = preProcessCommentOrReplyText(reply.text);
        if (mentions.length > 0) {
          mentions.forEach(async (mention) => {
            const validStudent = await Student.findOne({
              username: new RegExp("^" + mention + "$", "i"),
            });
            if (validStudent) {
              if (validStudent.email !== commentOwner.email) {
                // only send mail if the user is not the same as the commentor
                // since commentors recieve their own mails seperately
                // send mail to the student
                const newStudentNotification = new StudentNotification({
                  student: validStudent._id,
                  message: `${reply.username} mentioned you in a reply.`,
                  title: `${reply.username}`,
                  type: "reply added",
                  courseunitid: req.params.courseunitId,
                  commentid: comment._id,
                  replyid: reply._id,
                  coursechapterid: req.params.coursechapterId,
                });

                newStudentNotification.save();

                sendReplyMentionStudentNotification(
                  validStudent.email,
                  reply.username,
                  reply.text,
                  reply.courseunit,
                  reply.comment,
                  reply.coursechapter,
                  reply._id,
                  schoolname
                );
              }
              // send mail to student
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
  }
);

router.get("/:commentId", auth, async (req, res) => {
  const { page, size } = req.query;

  const limit = parseInt(size);
  const skip = parseInt(page - 1) * size;

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

    const replies = await Reply.paginate(
      {
        comment: comment._id,
      },
      {
        offset: skip,
        limit: limit,
      }
    );
    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

router.delete("/:replyId", auth, studentAuth, async (req, res) => {
  try {
    const reply = await Reply.findOne({
      _id: req.params.replyId,
    });

    if (!reply) {
      return res.status(400).json({
        errors: [
          {
            msg: "reply not found",
          },
        ],
      });
    }

    await reply.remove();
    res.json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

export default router;
