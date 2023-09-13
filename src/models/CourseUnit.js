import mongoose from "mongoose";

const courseUnitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    videourl: {
      type: String,
    },
    cloudflare_hsl_videourl: {
      type: String,
    },
    cloudflare_dash_videourl: {
      type: String,
    },
    cloudflare_error_message: {
      type: String,
    },
    isStreamReady: {
      type: Boolean,
    },
    isCloudflareVideoSource: {
      type: Boolean,
    },
    isCloudflareVideoErrorState: {
      type: Boolean,
      default: false,
    },
    pdfUrl: {
      type: String,
    },
    pdfName: {
      type: String,
    },
    pdfFileSize: {
      type: Number,
    },
    pdfPublicId: {
      type: String,
    },
    isPdf: {
      type: Boolean,
    },
    videothumbnail: {
      type: String,
    },
    position: {
      type: Number,
    },
    videopublicid: {
      type: String,
    },
    is_preview_able: {
      type: Boolean,
      default: false,
    },
    attachment: [
      {
        url: {
          type: String,
        },
        filename: {
          type: String,
        },
        attachmentId: {
          type: String,
        },
      },
    ],
    file_size: {
      type: Number,
    },
    duration: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment",
      },
    ],
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      required: true,
    },
    coursechapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coursechapter",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

courseUnitSchema.index({ name: 1 });
courseUnitSchema.index({ author: 1 });
courseUnitSchema.index({ course: 1 });
courseUnitSchema.index({ isStreamReady: 1 });
courseUnitSchema.index({ is_preview_able: 1 });
courseUnitSchema.index({ is_preview_able: 1, course: 1 });
courseUnitSchema.index({ isStreamReady: 1, course: 1 });

const CourseUnit = mongoose.model("courseunit", courseUnitSchema);

export default CourseUnit;
