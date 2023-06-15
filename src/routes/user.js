import express from "express";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import multer, { memoryStorage } from "multer";
import School from "../models/School";
import Theme from "../models/Theme";
import Affiliate from "../models/Affiliates";
import Sections from "../models/Sections";
import Wallet from "../models/Wallet";
import Bankdetails from "../models/Bankdetails";
import Order from "../models/Order";
import ThemePreview from "../models/Themepreview";
import { welcomeToTurtolyNotification } from "../emails/notifications/tutuor";
import { verifyAccountEmail } from "../emails/notifications/tutuor";
import { sendPasswordResetLink } from "../emails/password reset/tutor";
import dataUri from "../utilities/dataUri";

import auth from "../middleware/auth";

const router = express.Router();
const tokenSecret = process.env.JWTSECRET;

router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("selectedplan");

    if (!user) {
      return res.status(404).json({ errors: [{ msg: "user not found" }] });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});

router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({
      _id: userId,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "user not found" }] });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});

router.get("/resend/link/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({
      _id: userId,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ errors: [{ msg: "user not found" }] });
    }
    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(payload, tokenSecret, { expiresIn: 900 }, (err, token) => {
      if (err) throw err;
      verifyAccountEmail(user.email, token);
      res.json({
        // nothing is done with the token
        // but token is sent off, so client can know request ended successfully
        token,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});

router.post(
  "/signup",
  body("email", "Please include a valid email address").isEmail(),
  body(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password, ref } = req.body;
    try {
      let user = await User.findOne({
        email,
      });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exist's" }] });
      }

      const avatar = gravatar.url(email, {
        s: "250",
        r: "pg",
        d: "mm",
      });

      const userDetails = {
        email,
        password,
        createdVia: "custom",
        avatar,
        selectedplan: process.env.IDOFFREEPLAN,
      };

      if (ref) {
        const validAffiliateUser = await Affiliate.findOne({
          code_name: ref,
        });

        if (validAffiliateUser) {
          userDetails["referedBy"] = validAffiliateUser._id;
        }
      }

      user = new User(userDetails);

      const salt = await bcrypt.genSalt(10); // generate salt for password
      user.password = await bcrypt.hash(password, salt); // use salt to hash password
      await user.save(); // save user

      // code to create token payload
      const payload = {
        user: {
          id: user._id,
        },
      };

      welcomeToTurtolyNotification(email);

      jwt.sign(payload, tokenSecret, { expiresIn: 900 }, (err, token) => {
        if (err) throw err;
        verifyAccountEmail(email, token);
        res.json({
          // nothing is done with the token
          // but token is sent off, so client can know request ended successfully
          token,
          user: user,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("internal server error");
    }
  }
);

router.post(
  "/signin",
  body("email", "please include a valid email").isEmail(),
  body("password", "Please enter a password").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "invalid credentials" }],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: "invalid credentials" }],
        });
      }

      // code to create token payload
      const payload = {
        user: {
          id: user._id,
        },
      };

      if (user.isverified === false) {
        jwt.sign(payload, tokenSecret, { expiresIn: 900 }, (err, token) => {
          if (err) throw err;
          verifyAccountEmail(email, token);
          res.json({
            token,
            user,
          });
        });
      } else {
        jwt.sign(payload, tokenSecret, { expiresIn: 360000 }, (err, token) => {
          if (err) throw err;
          const newUserData = Object.assign(user.toObject(), {});
          delete newUserData.password;
          res.json({
            token,
            user: newUserData,
          });
        });
      }
    } catch (error) {
      res.status(500).send("Server error");
      console.error(error);
    }
  }
);

router.put(
  "/account/setup/stepcomplete",
  auth,
  [
    body("firstname", "firstname is required").not().isEmpty(),
    body("lastname", "lastname is required").not().isEmpty(),
    body("username", "username is required").not().isEmpty(),
    body("field", "field is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, username, field, about, other } = req.body;

    const specialCharacterRegex = /[!"#$%&'()*+,./:;<=>?@[\]^_` {|}~]/g; // handles puntuations and spaces inbetween regex...

    if (
      username.toString().toLowerCase() === "www" ||
      username.toString().toLowerCase() === "app" ||
      username.toString().toLowerCase() === "tuturly" ||
      username.toString().toLowerCase() === "degraphe" ||
      specialCharacterRegex.test(username) === true
    ) {
      return res.status(400).json({
        errors: [
          {
            msg: `invalid username. Please ensure that it doesn't contain the following symbols "!"#$%&'()*+,-./:;<=>?@[\]^_ {|}~"
            and is in smaller case`,
          },
        ],
      });
    }

    try {
      let user = await User.findOne({
        _id: req.user.id,
      });

      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: "user not valid",
            },
          ],
        });
      }

      const userWithExistingUsername = await User.findOne({
        username: username.toString().toLowerCase(),
      });

      const schoolExist = await School.findOne({
        name: username.toString().toLowerCase(),
      });

      if (userWithExistingUsername || schoolExist) {
        return res.status(400).json({
          errors: [
            {
              msg: "username already exist's",
            },
          ],
        });
      }

      const school = new School({
        name: username.toString().toLowerCase(),
        createdBy: req.user.id,
      });

      user.firstname = firstname;
      user.lastname = lastname;
      user.username = username.toString().toLowerCase();
      if (field.toLowerCase() === "other") {
        user.field = other;
      } else {
        user.field = field;
      }
      user.about = about;
      user.segment = 1;
      user.setupComplete = true;
      user.createdVia = "custom"; // used to track the method the user used in creating the account

      // await school.save()

      // code to set up theme for user during sign up process

      const ThemePreviews = await ThemePreview.find().sort("createdAt");

      const defaultSelectedTheme = ThemePreviews[1];

      const newThemeObject = {};
      newThemeObject["name"] = defaultSelectedTheme.name;
      newThemeObject["schoolId"] = school._id;
      newThemeObject["themestyles"] = defaultSelectedTheme.themedefaultstyles;
      newThemeObject["defaultassets"] = defaultSelectedTheme.defaultassets;

      // save themepreview name in
      school.themename = defaultSelectedTheme.name;
      school.themepreviewid = defaultSelectedTheme._id;

      const newTheme = new Theme(newThemeObject);

      await newTheme.save();
      await school.save();
      await user.save();

      let sectionPosition = 0; // when user has no theme and so no existing sections

      defaultSelectedTheme.requiredsetions.forEach(
        async (themePreviewItemName) => {
          const { name, usesecondarycolorscheme, alternatecolumns } =
            themePreviewItemName;

          const sectionObject = {
            name: name,
            position: sectionPosition,
            userId: user._id,
            schoolId: school._id,
            isusingsecondarystyles: usesecondarycolorscheme,
            alternatecolumns: alternatecolumns,
            parenttheme: newTheme._id,
            issystemcreatedsection: true,
          };

          const newSection = new Sections(sectionObject);
          sectionPosition++;
          await newSection.save();
        }
      );

      // end of code to setup theme and section for user during sign up process

      res.json({
        user,
        school,
      });
    } catch (error) {
      res.status(500).send("Server error");
      console.error(error);
    }
  }
);

const userProfileAvatarUpload = memoryStorage();
const thumbUploadHandler = multer({
  storage: userProfileAvatarUpload,
  fileFilter(req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
});

router.put(
  "/avatar/upload",
  auth,
  thumbUploadHandler.single("avatar"),
  async (req, res) => {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        errors: [{ msg: "image file not found" }],
      });
    }
    try {
      const user = await User.findOne({
        _id: userId,
      })
        .select("-password")
        .populate("selectedplan");

      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "user not found" }],
        });
      }

      // detele previous user thumbnail by cloudinaryAvatar imageID
      // if the user cloudinary avatar ID is present
      if (user.cloudinaryAvatarId) {
        await cloudinary.v2.uploader.destroy(user.cloudinaryAvatarId);
      }

      const fileType = `.${
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ]
      }`;
      const imageToBeUploaded = dataUri(`${fileType}`, req.file.buffer).content;
      const uploadResponse = await cloudinary.v2.uploader.upload(
        imageToBeUploaded,
        {
          folder: `tuturly/avatar/${user.username}`,
        }
      );

      user.avatar = uploadResponse.secure_url;
      user.cloudinaryAvatarId = uploadResponse.public_id;
      await user.save();
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

router.put(
  "/account/settings/update",
  auth,
  [
    body("username", "username not found").not().isEmpty(),
    body("firstname", "firstname not valid").not().isEmpty(),
    body("lastname", "lastname not valid").not().isEmpty(),
    body("field", "field not valid").not().isEmpty(),
    body("about", "about not valid").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, username, field, about } = req.body;

    try {
      const user = await User.findOne({
        _id: req.user.id,
      })
        .select("-password")
        .populate("selectedplan");

      if (!user) {
        // throw error if user not found...
        return res.status(400).json({
          errors: [{ msg: "user not found" }],
        });
      }

      const school = await School.findOne({
        createdBy: req.user.id,
      });
      const specialCharacterRegex = /[!"#$%&'()*+,./:;<=>?@[\]^_` {|}~]/g; // handles puntuations and spaces inbetween regex...
      if (
        username.toString().toLowerCase() === "www" || // ensure user choose select valid username
        username.toString().toLowerCase() === "app" ||
        username.toString().toLowerCase() === "tuturly" ||
        username.toString().toLowerCase() === "degraphe" ||
        specialCharacterRegex.test(username) === true
      ) {
        return res.status(400).json({
          errors: [
            {
              msg: `invalid username. Please ensure that it doesn't contain the following symbols "!"#$%&'()*+,-./:;<=>?@[\]^_ {|}~"
              and is in smaller case`,
            },
          ],
        });
      }

      if (user.username !== username) {
        // if user updates username, change schoolname to
        // newly applied username
        const userExistWithUsername = await User.findOne({
          username: username,
        });
        if (userExistWithUsername) {
          return res.status(400).json({
            errors: [
              {
                msg: "invalid username, username alredy exist",
              },
            ],
          });
        }
        school.name = username.toLowerCase();
        await school.save();
      }

      user.firstname = firstname;
      user.lastname = lastname;
      user.username = username.toLowerCase();
      user.field = field;
      user.about = about;

      await user.save();

      res.json({
        user,
        school,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

router.put(
  "/account/password/change",
  auth,
  [
    body("oldpassword", "old password required").not().isEmpty(),
    body("newpassword", "new password required").not().isEmpty(),
    body("confirmpassword", "confirm password is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldpassword, newpassword, confirmpassword } = req.body;

    try {
      const user = await User.findOne({
        _id: req.user.id,
      });

      if (!user) {
        // throw error if user not found...
        return res.status(400).json({
          errors: [{ msg: "user not found" }],
        });
      }

      const isMatch = await bcrypt.compare(oldpassword, user.password);

      if (isMatch === false) {
        return res.status(400).json({
          errors: [{ msg: "invalid old password" }],
        });
      }

      if (newpassword !== confirmpassword) {
        return res.status(400).json({
          errors: [{ msg: "passwords do not match" }],
        });
      }

      const salt = await bcrypt.genSalt(10); // generate salt for password
      user.password = await bcrypt.hash(newpassword, salt); // use salt to hash password
      await user.save(); // save user

      res.json();
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

router.put("/account/verify/:token", async (req, res) => {
  const token = req.params.token;
  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.user = decoded.user;
    const user = await User.findOne({
      _id: req.user.id,
    });
    user.isverified = true;
    await user.save();

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(payload, tokenSecret, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
      });
    });
  } catch (error) {
    res.status(400).json({
      msg: "Token is not valid",
    });
  }
});

router.put("/dashboard/markdisplaywalkasseen", auth, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
    });

    if (!user) {
      // throw error if user not found...
      return res.status(400).json({
        errors: [{ msg: "user not found" }],
      });
    }
    user.displaywalkthrough = false;
    await user.save();
    res.json();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.put("/dashboard/marknewfeatureasseen", auth, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id,
    });

    if (!user) {
      // throw error if user not found...
      return res.status(400).json({
        errors: [{ msg: "user not found" }],
      });
    }
    user.showNewFeatureAnnouncementModal = false;
    await user.save();
    res.json();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/account/setup/existinguser/username", async (req, res) => {
  const usernameQuery = req.query.username;
  try {
    if (usernameQuery) {
      const users = await User.find({
        username: usernameQuery,
      });
      res.json(users);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.get("/password/reset/:emailAddress", async (req, res) => {
  const userEmail = req.params.emailAddress;
  try {
    const user = await User.findOne({
      email: userEmail,
    });

    if (user) {
      const payload = {
        user: {
          id: user._id,
        },
      };

      const token = await jwt.sign(payload, tokenSecret, { expiresIn: "24h" });

      await sendPasswordResetLink(user.email, token);
    }
    res.status(200).send("done.");
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error);
  }
});

router.get("/password/token/:token", async (req, res) => {
  const userToken = req.params.token;
  try {
    const decoded = await jwt.verify(userToken, process.env.JWTSECRET);
    res.json(decoded.user);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Token is not valid",
    });
  }
});

router.put(
  "/password/change/:userid",
  [
    body("password", "password not found").not().isEmpty(),
    body("confirmpassword", "confirm password not found").not().isEmpty(),
  ],
  async (req, res) => {
    const userId = req.params.userid;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
      return res
        .status(400)
        .json({ errors: [{ msg: "passwords do not match." }] });
    }

    try {
      const user = await User.findOne({
        _id: userId,
      });

      const salt = await bcrypt.genSalt(10); // generate salt for password
      user.password = await bcrypt.hash(password, salt); // use salt to hash password
      await user.save();
      res.status(200).send("done.");
    } catch (error) {
      res.status(500).send("Server Error");
      console.log(error);
    }
  }
);

router.delete("/", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      // throw error if user not found...
      return res.status(400).json({
        errors: [{ msg: "user not found" }],
      });
    }

    const school = await School.findOne({ createdBy: user._id });
    if (!school) {
      // throw error if school not found...
      return res.status(400).json({
        errors: [{ msg: "school not found" }],
      });
    }

    await Wallet.deleteMany({ user: user._id }); // delete user wallet
    await Sections.deleteMany({ userId: user._id }); // sections
    await Bankdetails.deleteMany({ user: user._id }); // delete bank details
    await Theme.deleteOne({ schoolId: school._id }); // delete user school

    await school.remove(); // delete school
    await user.remove(); // and finally delete user
    res.json();
  } catch (error) {
    res.status(500).send("Server Error");
    console.log(error);
  }
});

export default router;
