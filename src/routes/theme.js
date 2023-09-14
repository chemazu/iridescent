import express from "express";
import { body, validationResult } from "express-validator";
import cloudinary from "cloudinary";
import sharp from "sharp";
import multer, { memoryStorage } from "multer";
import auth from "../middleware/auth";
import validateUserPayment from "../middleware/validateUserPayment";
import Theme from "../models/Theme";
import School from "../models/School";
import Themepreview from "../models/Themepreview";
import dataUri from "../utilities/dataUri";
import Section from "../models/Sections";

const router = express.Router();

// route to get theme by school Id
router.get("/:schoolId", async (req, res) => {
  const schoolId = req.params.schoolId;
  try {
    const theme = await Theme.findOne({
      schoolId: schoolId,
    });

    if (!theme) {
      return res.status(404).json({
        errors: [
          {
            msg: "school theme not found",
          },
        ],
      });
    }

    res.json(theme);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});

// route to create new theme or update school theme name
router.post(
  "/:schoolId/:themepreviewId",
  auth,
  validateUserPayment,
  async (req, res) => {
    const themepreviewId = req.params.themepreviewId;
    const schoolId = req.params.schoolId;
    try {
      const school = await School.findOne({
        _id: schoolId,
      });

      if (!school) {
        return res.status(404).json({
          errors: [{ msg: "school not found" }],
        });
      }

      // check if school already has a theme
      const schoolThemeExists = await Theme.findOne({
        schoolId: schoolId,
      });

      const previewThemeInfo = await Themepreview.findOne({
        _id: themepreviewId,
      });

      if (schoolThemeExists) {
        // school theme exists, update school schoolId on theme
        // and update themename and themeid on school

        // update school theme name
        school.themename = previewThemeInfo.name;
        school.themepreviewid = previewThemeInfo._id;

        // update theme structure to the new chosen theme details
        schoolThemeExists.name = previewThemeInfo.name;
        schoolThemeExists.themestyles = previewThemeInfo.themedefaultstyles;
        schoolThemeExists.defaultassets = previewThemeInfo.defaultassets;

        await school.save();
        await schoolThemeExists.save();

        // delete all the sections created by the previous theme
        await Section.deleteMany({
          schoolId: school._id,
          issystemcreatedsection: true,
        });

        // get count of the remaining sections, this are the sections created by the
        // user. this are not systemBased sections
        const remainingSectionsCount = await Section.find({
          schoolId: school._id,
          issystemcreatedsection: false,
        }).sort("position");

        let sectionPosition = 0;

        previewThemeInfo.requiredsetions.forEach(
          async (themePreviewItemName) => {
            const { name, usesecondarycolorscheme, alternatecolumns } =
              themePreviewItemName;

            const sectionObject = {
              name: name,
              position: sectionPosition,
              userId: req.user.id,
              schoolId: school._id,
              isusingsecondarystyles: usesecondarycolorscheme,
              alternatecolumns: alternatecolumns,
              parenttheme: schoolThemeExists._id,
              issystemcreatedsection: true,
            };

            const newSection = new Section(sectionObject);
            sectionPosition++;
            await newSection.save();
          }
        );

        remainingSectionsCount.forEach(async (section) => {
          section.position = sectionPosition;
          sectionPosition++;
          await section.save();
        });

        return res.json({
          theme: schoolThemeExists,
          school: school,
        });
      }

      const newThemeObject = {};
      newThemeObject["name"] = previewThemeInfo.name;
      newThemeObject["schoolId"] = school._id;
      newThemeObject["themestyles"] = previewThemeInfo.themedefaultstyles;
      newThemeObject["defaultassets"] = previewThemeInfo.defaultassets;

      // save themepreview name in
      school.themename = previewThemeInfo.name;
      school.themepreviewid = previewThemeInfo._id;

      const newTheme = new Theme(newThemeObject);

      await newTheme.save();
      await school.save();

      let sectionPosition = 0; // when user has no theme and so no existing sections

      previewThemeInfo.requiredsetions.forEach(async (themePreviewItemName) => {
        const { name, usesecondarycolorscheme, alternatecolumns } =
          themePreviewItemName;

        const sectionObject = {
          name: name,
          position: sectionPosition,
          userId: req.user.id,
          schoolId: school._id,
          isusingsecondarystyles: usesecondarycolorscheme,
          alternatecolumns: alternatecolumns,
          parenttheme: newTheme._id,
          issystemcreatedsection: true,
        };

        const newSection = new Section(sectionObject);
        sectionPosition++;
        await newSection.save();
      });

      res.json({
        theme: newTheme,
        school: school,
      });
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

const storageDestThemeAssets = memoryStorage();

const uplaodThemeAssets = multer({
  storage: storageDestThemeAssets,
  fileFilter(req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
});

// route to update theme data
// by schoolID
router.put(
  "/setup/themeinfo/:schoolId",
  [
    auth,
    validateUserPayment,
    uplaodThemeAssets.fields([{ name: "logo" }, { name: "favicon" }]),
    body("title", "title can not be empty").not().isEmpty(),
    body("countryphonecode", "phone code can not be empty").not().isEmpty(),
    // body('description', 'description can not be empty').not().isEmpty(),
    body("address", "address can not be empty").not().isEmpty(),
    body("phone", "phone cannot be empty").not().isEmpty(),
  ],
  async (req, res) => {
    const schoolId = req.params.schoolId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const school = await School.findOne({
        _id: schoolId,
      });

      if (!school) {
        return res.status(400).json({
          errors: [{ msg: "school not found" }],
        });
      }

      const existingTheme = await Theme.findOne({
        schoolId: schoolId,
      });

      let logoUploadResponse;
      let faviconUploadResponse;

      if (Object.entries(req.files).length !== 0) {
        const logoImage =
          req.files?.logo !== undefined ? req.files.logo[0] : undefined;
        const favIconImage =
          req.files?.favicon !== undefined ? req.files.favicon[0] : undefined;

        if (logoImage) {
          const logoFileType = `.${
            req.files.logo[0].originalname.split(".")[
              req.files.logo[0].originalname.split(".").length - 1
            ]
          }`;

          // run a check if previous logo exists
          // then delete from cloud server
          if (existingTheme.logo) {
            await cloudinary.v2.uploader.destroy(existingTheme.logocloudid);
          }

          const logoToBeUploaded = dataUri(
            `${logoFileType}`,
            req.files.logo[0].buffer
          ).content;

          logoUploadResponse = await cloudinary.v2.uploader.upload(
            logoToBeUploaded,
            {
              folder: `tuturly/school/${school.name}/ThemeAssets`,
            }
          );
        }

        if (favIconImage) {
          const faviconFileType = `.${
            req.files.favicon[0].originalname.split(".")[
              req.files.favicon[0].originalname.split(".").length - 1
            ]
          }`;

          // run a check if previous favicon exists
          // then delete from cloud server
          if (existingTheme.favicon) {
            await cloudinary.v2.uploader.destroy(existingTheme.faviconcloudid);
          }

          const faviconToBeUploaded = dataUri(
            `${faviconFileType},`,
            req.files.favicon[0].buffer
          ).content;

          faviconUploadResponse = await cloudinary.v2.uploader.upload(
            faviconToBeUploaded,
            {
              folder: `tuturly/school/${school.name}/ThemeAssets`,
            }
          );
        }
      }

      const {
        title,
        description,
        address,
        phone,
        countryphonecode,
        googleurl,
        youtubeurl,
        twitterurl,
        facebookurl,
        instagramurl,
      } = req.body;

      let themeUpdates = {
        title: title,
        description: description,
        phonenumber: phone,
        countryphonecode: countryphonecode,
        address: address,
        googleurl: googleurl,
        youtubeurl: youtubeurl,
        twitterurl: twitterurl,
        facebookurl: facebookurl,
        instagramurl: instagramurl,
      };

      if (logoUploadResponse !== undefined) {
        themeUpdates["logo"] = logoUploadResponse.secure_url;
        themeUpdates["logocloudid"] = logoUploadResponse.public_id;
      }

      if (faviconUploadResponse !== undefined) {
        themeUpdates["favicon"] = faviconUploadResponse.secure_url;
        themeUpdates["faviconcloudid"] = faviconUploadResponse.public_id;
      }

      const theme = await Theme.findOneAndUpdate(
        {
          schoolId: schoolId,
        },
        themeUpdates,
        {
          new: true,
        }
      );

      res.json(theme);
    } catch (error) {
      res.status(500).send("server error");
      console.log(error);
    }
  }
);

// route to update school logo via
// school landing page
router.put(
  "/setup/themeinfo/image/:schoolId",
  auth,
  validateUserPayment,
  uplaodThemeAssets.single("logo"),
  async (req, res) => {
    const schoolId = req.params.schoolId;
    try {
      const school = await School.findOne({
        _id: schoolId,
      });

      if (!school) {
        return res.status(400).json({
          errors: [{ msg: "school not found" }],
        });
      }

      const theme = await Theme.findOne({
        schoolId: schoolId,
      });

      // run a check if previous logo exists
      // then delete from cloud server
      if (theme.logo) {
        await cloudinary.v2.uploader.destroy(theme.logocloudid);
      }

      const logoFileType = `.${
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ]
      }`;

      const logoToBeUploaded = dataUri(
        `${logoFileType}`,
        req.file.buffer
      ).content;

      const logoUploadResponse = await cloudinary.v2.uploader.upload(
        logoToBeUploaded,
        {
          folder: `tuturly/school/${school.name}/ThemeAssets`,
        }
      );

      theme.logo = logoUploadResponse.secure_url;
      theme.logocloudid = logoUploadResponse.public_id;
      await theme.save();
      res.json(theme);
    } catch (error) {
      res.status(500).send("server error");
      console.log(error);
    }
  }
);

const storageDest = memoryStorage();

const upload = multer({
  storage: storageDest,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|JPEG)$/)) {
      return cb(new Error("Please Upload another image"));
    }
    cb(undefined, true);
  },
});

const bannerUpload = upload.single("banner");

router.put(
  "/setup/assetupload/banner/:schoolId",
  [auth, body("banner", "image not found").not().isEmpty()],
  async (req, res) => {
    const schoolId = req.params.schoolId;

    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    bannerUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          errors: [{ msg: "invalid image type" }],
        });
      }
    });

    try {
      let theme = await Theme.findOne({ schoolId: schoolId });
      let school = await School.findOne({ _id: schoolId });

      if (!theme) {
        return res.status(404).json({
          errors: [{ msg: "theme not found" }],
        });
      }
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 1400, height: 500 })
        .png()
        .toBuffer();

      const bannerToBeUploaded = dataUri(".png", buffer).content;

      let uploadResponse = await cloudinary.v2.uploader.upload(
        bannerToBeUploaded,
        {
          folder: `tuturly/schoolId-${school.name}/themeassets`,
          public_id: `${school.name}-banner`,
        }
      );

      theme.themeimage = uploadResponse.url;
      await theme.save();

      res.json(theme);
    } catch (error) {
      console.error(error);
    }
  }
);

const aboutUpload = upload.single("about");

router.put(
  "/setup/assetupload/aboutimage/:schoolId",
  [auth, body("instructorimage", "image not found").not().isEmpty()],
  async (req, res) => {
    const schoolId = req.params.schoolId;

    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    aboutUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          errors: [{ msg: "invalid image type" }],
        });
      }
    });

    try {
      let theme = await Theme.findOne({ schoolId: schoolId });
      let school = await School.findOne({ _id: schoolId });

      if (!theme) {
        return res.status(404).json({
          errors: [{ msg: "theme not found" }],
        });
      }
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 200, height: 200 })
        .png()
        .toBuffer();

      const bannerToBeUploaded = dataUri(".png", buffer).content;

      let uploadResponse = await cloudinary.v2.uploader.upload(
        bannerToBeUploaded,
        {
          folder: `tuturly/schoolId-${school.name}/themeassets`,
          public_id: `${school.name}-about`,
        }
      );

      theme.instructorimage = uploadResponse.url;
      await theme.save();

      res.json(theme);
    } catch (error) {
      console.error(error);
    }
  }
);

router.put(
  "/setup/contactinfo/:schoolId",
  [
    auth,
    body("address", "address is required").not().isEmpty(),
    body("phone", "phone is required").not().isEmpty(),
    body("phonecc", "phone country code is required").not().isEmpty(),
  ],
  async (req, res) => {
    const schoolId = req.params.schoolId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      address,
      phone,
      phonecc,
      googleurl,
      facebookurl,
      youtubeurl,
      twitterurl,
      instagramurl,
    } = req.body;

    try {
      let theme = await Theme.findOne({
        schoolId,
      });

      theme.contactaddress = address;
      theme.phonenumber = phone;
      theme.countryphonecode = phonecc;

      if (googleurl) theme.googleurl = googleurl;
      if (facebookurl) theme.facebookurl = facebookurl;
      if (youtubeurl) theme.youtubeurl = youtubeurl;
      if (twitterurl) theme.twitterurl = twitterurl;
      if (instagramurl) theme.instagramurl = instagramurl;

      await theme.save();
      res.json(theme);
    } catch (error) {
      res.status(500).send("server error");
      console.error(error);
    }
  }
);

export default router;
