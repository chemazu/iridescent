import express from "express";
import Section from "../models/Sections";
import School from "../models/School";
import { body, validationResult } from "express-validator";
import multer, { memoryStorage } from "multer";
import cloudinary from "cloudinary";
import axios from "axios";
import auth from "../middleware/auth";
import validateUserPayment from "../middleware/validateUserPayment";
import validateUserUploadAgainstAvailableUsageQuota from "../middleware/validateUserUploadAgainstAvailableUsageQuota";
import dataUri from "../utilities/dataUri";

const router = express.Router();

// add theme sections endpoint
// sections endpoint requires name of section, position of section that lunched it
router.post(
  "/:schoolId",
  auth,
  validateUserPayment,
  [
    body("name", "section name is required").not().isEmpty(),
    body("parenttheme", "parent theme Id required").not().isEmpty(),
    body("previousSectionPosition", "previous section position required")
      .not()
      .isEmpty(), // the position of the ID where the add section modal was launched
    body("isUsingSecondaryStyles", "is using secondary themes is required")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const userId = req.user.id;
    const schoolId = req.params.schoolId;
    const {
      name,
      parenttheme,
      previousSectionPosition,
      isUsingSecondaryStyles,
    } = req.body;

    try {
      const sectionsObject = {
        name: name,
        position: previousSectionPosition + 1,
        userId: userId,
        schoolId: schoolId,
        parenttheme: parenttheme,
        isusingsecondarystyles: isUsingSecondaryStyles,
        issystemcreatedsection: false,
        canberepositioned: true,
      };
      const newSection = new Section(sectionsObject);

      const sectionsPositionToBeUpdated = await Section.find({
        // search all sections with positions greater
        // than the section that is used as reference for add new section
        schoolId: schoolId,
      })
        .where("position")
        .gt(previousSectionPosition)
        .sort("position");

      let positionForUpdatedSection = previousSectionPosition + 2;

      if (sectionsPositionToBeUpdated.length > 0) {
        // reposition sections that come after
        // the section with a ealier position
        sectionsPositionToBeUpdated.forEach(async (section) => {
          section.position = positionForUpdatedSection;
          positionForUpdatedSection++;
          await section.save();
        });
      }

      await newSection.save();

      const sortedSections = await Section.find({
        schoolId: schoolId,
      }).sort("position");

      res.json(sortedSections);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

router.get("/:schoolId", async (req, res) => {
  const schoolId = req.params.schoolId;
  try {
    const sections = await Section.find({
      schoolId: schoolId,
    }).sort("position");
    res.json(sections);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

router.put(
  "/:schoolId/reorder",
  [body("list", "list cannot be empty").not().isEmpty()],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const validSchool = await School.findOne({
        _id: req.params.schoolId,
      });
      if (!validSchool) {
        return res.status(400).json({
          errors: [{ msg: "school not found" }],
        });
      }
      const { list } = req.body;
      list.forEach(async (sectionItem) => {
        const section = await Section.findOne({
          _id: sectionItem._id,
        });
        section.position = sectionItem.index;
        await section.save();
      });
      res.send();
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

router.delete(
  "/:schoolId/:sectionId",
  auth,
  validateUserPayment,
  async (req, res) => {
    const sectionId = req.params.sectionId;
    const schoolId = req.params.schoolId;

    try {
      const validSection = await Section.findOne({
        _id: sectionId,
      });
      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      let positionOfSectionToBeDeleted = validSection.position;

      const sectionsAfterSectionToBeDeleted = await Section.find({
        // search all sections with positions greater
        // than the section that is to be deleted
        schoolId: schoolId,
      })
        .where("position")
        .gt(validSection.position)
        .sort("position");

      sectionsAfterSectionToBeDeleted.forEach(async (section) => {
        section.position = positionOfSectionToBeDeleted;
        positionOfSectionToBeDeleted++;
        await section.save();
      });

      // handle deletion of video in cloud for video based section
      if (validSection.name === "video") {
        const previousVideoPublicId = validSection.video.videopublicid;
        if (previousVideoPublicId) {
          // check if video exist's in cloud server in the first place
          if (validSection.video.isCloudflareVideoSource === true) {
            const config = {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
              },
            };
            await axios.delete(
              `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${validSection.video.videopublicid}`,
              config
            );
          } else {
            await cloudinary.v2.uploader.destroy(
              validSection.video.videopublicid,
              {
                resource_type: "video",
              }
            );
          }
        }
      }
      await validSection.remove();

      const sortedSections = await Section.find({
        schoolId: schoolId,
      }).sort("position");

      res.json(sortedSections);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// the following endpoints ae used to update section fields
// according to the particular section

// 1. route to update the call To Action Section
const storageDest = memoryStorage();
const imageUploadHandler = multer({
  storage: storageDest,
  fileFilter(req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
});

// if(!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/)){
//     return cb(new Error('Please Upload another video'))
//  }
//  cb(undefined, true)

router.put(
  "/:sectionId/calltoaction",
  auth,
  validateUserPayment,
  imageUploadHandler.single("file"),
  [
    body("headertitle", "section header cannot be empty").not().isEmpty(),
    body("description", "section description cannot be empty").not().isEmpty(),
    body("buttonurl", "Button URL cannot be empty").not().isEmpty(),
    body("btntext", "Button text cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const sectionId = req.params.sectionId;

    const {
      headertitle,
      description,
      buttonurl,
      btntext,
      useSecondaryColorScheme,
      showSocialLinks,
    } = req.body;

    try {
      const sectionUpdates = {
        // these update Object map the call to action field in this section
        headertitle: headertitle,
        description: description,
        buttonurl: buttonurl,
        showsociallinks: showSocialLinks,
        btntext: btntext,
      };

      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      if (req.file) {
        // if user uploads image with the section update
        const previousImageUrl = validSection.calltoaction.imageurl;
        const previousImagePublicId = validSection.calltoaction.imagepublicid;
        if (previousImageUrl) {
          // if user has existing image save
          // call cloudinary function to delete it
          // then reupload new image
          await cloudinary.v2.uploader.destroy(previousImagePublicId, {
            resource_type: "raw",
          });

          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["imageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.calltoaction = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;

          await validSection.save();
          return res.json(validSection);
        } else {
          // else simply upload new image
          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["imageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.calltoaction = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;

          await validSection.save();
          return res.json(validSection);
        }
      }
      // return none the less
      sectionUpdates["imageurl"] = validSection.calltoaction.imageurl;
      sectionUpdates["imagepublicid"] = validSection.calltoaction.imagepublicid;
      validSection.calltoaction = sectionUpdates;
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// 2. update courselist section route
router.put(
  "/:sectionId/courselist",
  auth,
  validateUserPayment,
  async (req, res) => {
    const sectionId = req.params.sectionId;
    const { useSecondaryColorScheme } = req.body;
    try {
      const validSection = await Section.findOne({
        _id: sectionId,
      });
      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// update productlist section route
router.put(
  "/:sectionId/productlist",
  auth,
  validateUserPayment,
  async (req, res) => {
    const sectionId = req.params.sectionId;
    const { useSecondaryColorScheme } = req.body;
    try {
      const validSection = await Section.findOne({
        _id: sectionId,
      });
      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// 3. route to update image and text section
router.put(
  "/:sectionId/imageandtext",
  auth,
  validateUserPayment,
  imageUploadHandler.single("file"),
  [
    body("header", "section header cannot be empty").not().isEmpty(),
    body("subtitle", "section subtitile cannot be empty").not().isEmpty(),
    body("description", "section description cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const sectionId = req.params.sectionId;

    const {
      header,
      subtitle,
      description,
      useSecondaryColorScheme,
      textBeforeImageLayout,
    } = req.body;

    try {
      const sectionUpdates = {
        header: header,
        subtitle: subtitle,
        description: description,
      };

      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      if (req.file) {
        const previousImageUrl = validSection.imageandtext.imageurl;
        const previousImagePublicId = validSection.imageandtext.imagepublicid;

        if (previousImageUrl) {
          await cloudinary.v2.uploader.destroy(previousImagePublicId, {
            resource_type: "raw",
          });

          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["imageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.imageandtext = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;
          validSection.alternatecolumns = textBeforeImageLayout;

          await validSection.save();
          return res.json(validSection);
        } else {
          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["imageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.imageandtext = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;
          validSection.alternatecolumns = textBeforeImageLayout;

          await validSection.save();
          return res.json(validSection);
        }
      }

      sectionUpdates["imageurl"] = validSection.imageandtext.imageurl;
      sectionUpdates["imagepublicid"] = validSection.imageandtext.imagepublicid;
      validSection.imageandtext = sectionUpdates;
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      validSection.alternatecolumns = textBeforeImageLayout;

      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// 4. Route to update Header Text Hero Image Section
router.put(
  "/:sectionId/headertextheroimage",
  auth,
  validateUserPayment,
  imageUploadHandler.single("file"),
  [
    body("header", "setion header canoot be empty").not().isEmpty(),
    body("subtitle", "Section subtitle cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const sectionId = req.params.sectionId;
    const { header, subtitle, useSecondaryColorScheme, showSocialLinks } =
      req.body;

    try {
      const sectionUpdates = {
        header: header,
        subtitle: subtitle,
        showsociallinks: showSocialLinks,
      };

      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      if (req.file) {
        const previousImageUrl = validSection.headertextheroimage.heroimageurl;
        const previousImagePublicId =
          validSection.headertextheroimage.imagepublicid;

        if (previousImageUrl) {
          await cloudinary.v2.uploader.destroy(previousImagePublicId, {
            resource_type: "raw",
          });

          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["heroimageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.headertextheroimage = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;

          await validSection.save();
          return res.json(validSection);
        } else {
          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["heroimageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.headertextheroimage = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;

          await validSection.save();
          return res.json(validSection);
        }
      }

      sectionUpdates["heroimageurl"] =
        validSection.headertextheroimage.heroimageurl;
      sectionUpdates["imagepublicid"] =
        validSection.headertextheroimage.imagepublicid;
      validSection.headertextheroimage = sectionUpdates;
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// 5. Route to Update Text Overlay Section
router.put(
  "/:sectionId/textoverlay",
  auth,
  validateUserPayment,
  [
    body("headertext", "Section Header Text Cannot be Empty").not().isEmpty(),
    body("text", "Section Text Cannot be Empty").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const sectionId = req.params.sectionId;
    const { headertext, text, useSecondaryColorScheme } = req.body;

    try {
      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }
      const sectionUpdates = {
        headertext: headertext,
        text: text,
      };

      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      validSection.textimageoverlay = sectionUpdates;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// 6. Route to update video section
const videoUploadHandler = multer({
  storage: storageDest,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|mov)$/)) {
      return cb(new Error("Please Upload another video"));
    }
    cb(undefined, true);
  },
});

router.put(
  "/:sectionId/video",
  auth,
  validateUserPayment,
  [body("headertext", "Section Header text cannot be empty").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const sectionId = req.params.sectionId;
    const { headertext, useSecondaryColorScheme, isvideofullscreen, videoId } =
      req.body;

    try {
      const sectionUpdates = {
        headertext: headertext,
        isvideofullscreen: isvideofullscreen,
      };

      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      if (videoId) {
        // if videoId exist's then user has done video upload in the frontend
        const previousVideoPublicId = validSection.video.videopublicid;
        if (previousVideoPublicId) {
          // check if video has previous video in cloud server
          // handle deletion of previous video from cloud server
          if (validSection.video.isCloudflareVideoSource === true) {
            const config = {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
              },
            };
            await axios.delete(
              `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${previousVideoPublicId}`,
              config
            );
          } else {
            await cloudinary.v2.uploader.destroy(previousVideoPublicId, {
              resource_type: "raw",
            });
          }

          sectionUpdates["videopublicid"] = videoId;
          sectionUpdates["isCloudflareVideoSource"] = true;
          sectionUpdates["isStreamReady"] = false;
          validSection.video = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;
          await validSection.save();

          return res.json(validSection);
        } else {
          sectionUpdates["videopublicid"] = videoId;
          sectionUpdates["isCloudflareVideoSource"] = true;
          sectionUpdates["isStreamReady"] = false;
          validSection.video = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;
          await validSection.save();

          return res.json(validSection);
        }
      }

      sectionUpdates["videourl"] = validSection.video.videourl;
      sectionUpdates["videopublicid"] = validSection.video.videopublicid;
      sectionUpdates["isStreamReady"] = validSection.video.isStreamReady;
      sectionUpdates["isCloudflareVideoSource"] =
        validSection.video.isCloudflareVideoSource;
      sectionUpdates["cloudflare_hsl_videourl"] =
        validSection.video.cloudflare_hsl_videourl;
      sectionUpdates["cloudflare_dash_videourl"] =
        validSection.video.cloudflare_dash_videourl;
      sectionUpdates["videoSize"] = validSection.video.videoSize;
      sectionUpdates["videoDuration"] = validSection.video.videoDuration;

      validSection.video = sectionUpdates;
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// endpoint to get cloudflare upload url for video upload
router.get(
  "/:sectionId/video/cloudflare/:filesize",
  auth,
  validateUserPayment,
  validateUserUploadAgainstAvailableUsageQuota,
  async (req, res) => {
    const videoFileSize = req.params.filesize;
    const videoFileSizeInMegaBytes = videoFileSize / (1024 * 1024); // uploaded filesize in MB
    if (videoFileSizeInMegaBytes > 40) {
      // conditions ensures the file size is always below 256mb
      return res.status(400).json({
        errors: [
          {
            msg: "Video size exceeds maximum allowed for video upload",
          },
        ],
      });
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN}`,
        },
      };
      const cloudflarePostUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`;
      const body = JSON.stringify({
        maxDurationSeconds: 3600,
        creator: req.user.id,
        allowedOrigins: [
          "localhost:3000",
          "*.localhost:3000",
          "tuturly.com",
          "*.tuturly.com",
        ],
      });
      const cloudflareRes = await axios.post(cloudflarePostUrl, body, config);
      res.json(cloudflareRes.data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

// 7. Route to update Header text And Image Section
router.put(
  "/:sectionId/headertextandimage",
  auth,
  validateUserPayment,
  imageUploadHandler.single("file"),
  [
    body("header", "section header cannot be empty").not().isEmpty(),
    body("subtitle", "section subtitle cannot be required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const sectionId = req.params.sectionId;
    const { header, subtitle, useSecondaryColorScheme, showSocialLinks } =
      req.body;

    try {
      const sectionUpdates = {
        header: header,
        subtitle: subtitle,
        showsociallinks: showSocialLinks,
      };

      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      if (req.file) {
        const previousImageUrl = validSection.headertextandimage.imageurl;
        const previousImagePublicId =
          validSection.headertextandimage.imagepublicid;

        if (previousImageUrl) {
          await cloudinary.v2.uploader.destroy(previousImagePublicId, {
            resource_type: "raw",
          });

          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["imageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.headertextandimage = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;

          await validSection.save();
          return res.json(validSection);
        } else {
          const fileType = `.${
            req.file.originalname.split(".")[
              req.file.originalname.split(".").length - 1
            ]
          }`;
          const imageToBeUploaded = dataUri(
            `${fileType}`,
            req.file.buffer
          ).content;
          const uploadResponse = await cloudinary.v2.uploader.upload(
            imageToBeUploaded,
            {
              folder: `tuturly/userthemeassets/section/${validSection._id}`,
            }
          );

          sectionUpdates["imageurl"] = uploadResponse.secure_url;
          sectionUpdates["imagepublicid"] = uploadResponse.public_id;

          validSection.headertextandimage = sectionUpdates;
          validSection.isusingsecondarystyles = useSecondaryColorScheme;

          await validSection.save();
          return res.json(validSection);
        }
      }

      sectionUpdates["imageurl"] = validSection.headertextandimage.imageurl;
      sectionUpdates["imagepublicid"] =
        validSection.headertextandimage.imagepublicid;
      validSection.headertextandimage = sectionUpdates;
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// 8. Route to update section text and checklist section
router.put(
  "/:sectionId/textandchecklist",
  auth,
  validateUserPayment,
  body("text", "section text cannot be empty").not().isEmpty(),
  body("checklist", "checklist cannot be empty").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const sectionId = req.params.sectionId;
    const { text, checklist, useSecondaryColorScheme } = req.body;

    try {
      const sectionUpdates = {
        text: text,
        checklist: checklist.map((item) => {
          return { text: item, icon: "fa-check" };
        }),
      };

      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      validSection.textandchecklist = sectionUpdates;
      validSection.isusingsecondarystyles = useSecondaryColorScheme;
      await validSection.save();
      res.json(validSection);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

// 9. Route to update Three image Gallery section
router.put(
  "/:sectionId/threeimagegallery",
  auth,
  validateUserPayment,
  imageUploadHandler.fields([
    { name: "imagefileone" },
    { name: "imagefiletwo" },
    { name: "imagefilethree" },
  ]),
  [body("header", "site header cannot be empty").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const sectionId = req.params.sectionId;
    const { header, useSecondaryColorScheme } = req.body;

    try {
      const validSection = await Section.findOne({
        _id: sectionId,
      });

      if (!validSection) {
        return res.status(400).json({
          errors: [{ msg: "section not found" }],
        });
      }

      const sectionUpdates = {
        header: header,
      };
      // console.log(req.files, 'req.files')
      if (Object.entries(req.files).length !== 0) {
        const imageOne =
          req.files?.imagefileone !== undefined
            ? req.files?.imagefileone[0]
            : undefined;
        const imageTwo =
          req.files?.imagefiletwo !== undefined
            ? req.files?.imagefiletwo[0]
            : undefined;
        const imageThree =
          req.files?.imagefilethree !== undefined
            ? req.files?.imagefilethree[0]
            : undefined;

        if (imageOne) {
          if (validSection.galleryimageurls.imageone) {
            await cloudinary.v2.uploader.destroy(
              validSection.galleryimageurls.imageonepublicid,
              {
                resource_type: "raw",
              }
            );
            const fileType = `.${
              imageOne.originalname.split(".")[
                imageOne.originalname.split(".").length - 1
              ]
            }`;
            const imageToBeUploaded = dataUri(
              `${fileType}`,
              imageOne.buffer
            ).content;
            const uploadResponse = await cloudinary.v2.uploader.upload(
              imageToBeUploaded,
              {
                folder: `tuturly/userthemeassets/section/${validSection._id}`,
              }
            );
            validSection.galleryimageurls.imageone = uploadResponse.secure_url;
            validSection.galleryimageurls.imageonepublicid =
              uploadResponse.public_id;
          } else {
            const fileType = `.${
              imageOne.originalname.split(".")[
                imageOne.originalname.split(".").length - 1
              ]
            }`;
            const imageToBeUploaded = dataUri(
              `${fileType}`,
              imageOne.buffer
            ).content;
            const uploadResponse = await cloudinary.v2.uploader.upload(
              imageToBeUploaded,
              {
                folder: `tuturly/userthemeassets/section/${validSection._id}`,
              }
            );
            validSection.galleryimageurls.imageone = uploadResponse.secure_url;
            validSection.galleryimageurls.imageonepublicid =
              uploadResponse.public_id;
          }
        }

        if (imageTwo) {
          if (validSection.galleryimageurls.imagetwo) {
            await cloudinary.v2.uploader.destroy(
              validSection.galleryimageurls.imagetwopublicid,
              {
                resource_type: "raw",
              }
            );
            const fileType = `.${
              imageTwo.originalname.split(".")[
                imageTwo.originalname.split(".").length - 1
              ]
            }`;
            const imageToBeUploaded = dataUri(
              `${fileType}`,
              imageTwo.buffer
            ).content;
            const uploadResponse = await cloudinary.v2.uploader.upload(
              imageToBeUploaded,
              {
                folder: `tuturly/userthemeassets/section/${validSection._id}`,
              }
            );
            validSection.galleryimageurls.imagetwo = uploadResponse.secure_url;
            validSection.galleryimageurls.imagetwopublicid =
              uploadResponse.public_id;
          } else {
            const fileType = `.${
              imageTwo.originalname.split(".")[
                imageTwo.originalname.split(".").length - 1
              ]
            }`;
            const imageToBeUploaded = dataUri(
              `${fileType}`,
              imageTwo.buffer
            ).content;
            const uploadResponse = await cloudinary.v2.uploader.upload(
              imageToBeUploaded,
              {
                folder: `tuturly/userthemeassets/section/${validSection._id}`,
              }
            );
            validSection.galleryimageurls.imagetwo = uploadResponse.secure_url;
            validSection.galleryimageurls.imagetwopublicid =
              uploadResponse.public_id;
          }
        }

        if (imageThree) {
          if (validSection.galleryimageurls.imagethree) {
            await cloudinary.v2.uploader.destroy(
              validSection.galleryimageurls.imagethreepublicid,
              {
                resource_type: "raw",
              }
            );
            const fileType = `.${
              imageThree.originalname.split(".")[
                imageThree.originalname.split(".").length - 1
              ]
            }`;
            const imageToBeUploaded = dataUri(
              `${fileType}`,
              imageThree.buffer
            ).content;
            const uploadResponse = await cloudinary.v2.uploader.upload(
              imageToBeUploaded,
              {
                folder: `tuturly/userthemeassets/section/${validSection._id}`,
              }
            );
            validSection.galleryimageurls.imagethree =
              uploadResponse.secure_url;
            validSection.galleryimageurls.imagethreepublicid =
              uploadResponse.public_id;
          } else {
            const fileType = `.${
              imageThree.originalname.split(".")[
                imageThree.originalname.split(".").length - 1
              ]
            }`;
            const imageToBeUploaded = dataUri(
              `${fileType}`,
              imageThree.buffer
            ).content;
            const uploadResponse = await cloudinary.v2.uploader.upload(
              imageToBeUploaded,
              {
                folder: `tuturly/userthemeassets/section/${validSection._id}`,
              }
            );
            validSection.galleryimageurls.imagethree =
              uploadResponse.secure_url;
            validSection.galleryimageurls.imagethreepublicid =
              uploadResponse.public_id;
          }
        }

        validSection.isusingsecondarystyles = useSecondaryColorScheme;
        validSection.galleryimageurls.header = header;
        await validSection.save();
        res.json(validSection);
      } else {
        // sectionUpdates['imageone'] = validSection.galleryimageurls.imageone
        // sectionUpdates['imageonepublicid'] = validSection.galleryimageurls.imageonepublicid
        // sectionUpdates['imagetwo'] = validSection.galleryimageurls.imagetwo
        // sectionUpdates['imagetwopublicid'] = validSection.galleryimageurls.imagetwopublicid
        // sectionUpdates['imagethree'] = validSection.galleryimageurls.imagethree
        // sectionUpdates['imagethreepublicid'] = validSection.galleryimageurls.imagethreepublicid
        validSection.isusingsecondarystyles = useSecondaryColorScheme;
        validSection.galleryimageurls.header = header;
        await validSection.save();
        res.json(validSection);
      }
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

export default router;
