"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _Themepreview = _interopRequireDefault(require("../models/Themepreview"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // route to create a new theme previewer


router.post('/', [(0, _expressValidator.body)("name", "name is required").not().isEmpty(), (0, _expressValidator.body)("thumbnail", "thumbnail url is required").not().isEmpty(), (0, _expressValidator.body)('primarybackgroundcolor', 'primary background color required').not().isEmpty(), (0, _expressValidator.body)('primarytextcolor', 'primary text color required').not().isEmpty(), (0, _expressValidator.body)('secondarybackgroundcolor', 'secondarybackgroundcolor is required').not().isEmpty(), (0, _expressValidator.body)('secondarypagebackgroundcolor', 'secondary pages background colour required').not().isEmpty(), (0, _expressValidator.body)('secondarytextcolor', 'secondarytextcolor is required').not().isEmpty(), (0, _expressValidator.body)('fontfamily', 'font family is required').not().isEmpty(), (0, _expressValidator.body)('buttonbackgroundcolor', 'buttonbackgroundcolor is required').not().isEmpty(), (0, _expressValidator.body)('buttontextcolor', 'buttontextcolor is required').not().isEmpty(), (0, _expressValidator.body)('buttonborderradius', 'buttonborderradius is required').not().isEmpty(), (0, _expressValidator.body)('coursecardbackgroundcolor', 'coursecardbackgroundcolor is required').not().isEmpty(), (0, _expressValidator.body)('coursecardtextcolor', 'coursecardtextcolor is required').not().isEmpty(), (0, _expressValidator.body)('navbarbackgroundcolor', 'navbar background color is required').not().isEmpty(), (0, _expressValidator.body)('navbartextcolor', 'navbar text color is required').not().isEmpty(), (0, _expressValidator.body)('buttonaltbackgroundcolor', 'button alternate background color required').not().isEmpty(), (0, _expressValidator.body)('buttonalttextcolor', 'button alternate text color required').not().isEmpty(), (0, _expressValidator.body)('requiredsetions', 'required section is required').not().isEmpty(), // required sections, an array of section name
// used to loop through and create default themes for a new theme when that theme is created or selected
(0, _expressValidator.body)('footertextcolor', 'footer text color required').not().isEmpty(), (0, _expressValidator.body)('footerbackgroundcolor', 'footer background color is required').not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    name,
    thumbnail,
    primarybackgroundcolor,
    primarytextcolor,
    secondarybackgroundcolor,
    secondarytextcolor,
    secondarypagebackgroundcolor,
    fontfamily,
    buttonbackgroundcolor,
    buttontextcolor,
    buttonborderradius,
    coursecardbackgroundcolor,
    footertextcolor,
    footerbackgroundcolor,
    buttonaltbackgroundcolor,
    buttonalttextcolor,
    coursecardtextcolor,
    navbarbackgroundcolor,
    navbartextcolor,
    requiredsetions,
    // defaults assets
    defaultgalleryimage1,
    defaultgalleryimage2,
    defaultgalleryimage3,
    defaultcalltoactionheroimage,
    defaultimageandtextimage,
    defaultimageandtextimagealt,
    defaultheadertextandimage,
    defaultheaderheroimage
  } = req.body;

  try {
    const themedefaultStyles = {
      primarybackgroundcolor,
      primarytextcolor,
      secondarybackgroundcolor,
      secondarypagebackgroundcolor,
      secondarytextcolor,
      fontfamily,
      buttonbackgroundcolor,
      buttontextcolor,
      buttonborderradius,
      coursecardbackgroundcolor,
      coursecardtextcolor,
      navbarbackgroundcolor,
      navbartextcolor,
      footertextcolor,
      footerbackgroundcolor,
      buttonaltbackgroundcolor,
      buttonalttextcolor
    };
    const defaultImageAssets = {
      defaultgalleryimage1,
      defaultgalleryimage2,
      defaultgalleryimage3,
      defaultcalltoactionheroimage,
      defaultimageandtextimage,
      defaultimageandtextimagealt,
      defaultheadertextandimage,
      defaultheaderheroimage
    };
    const newThemePreviewer = new _Themepreview.default({
      name,
      thumbnail,
      requiredsetions,
      themedefaultstyles: themedefaultStyles,
      defaultassets: defaultImageAssets
    });
    await newThemePreviewer.save();
    res.json(newThemePreviewer);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
router.get('/', async (req, res) => {
  try {
    const themepreviewList = await _Themepreview.default.find().sort('name');
    res.json(themepreviewList);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
router.get('/:themePreviewId', _auth.default, async (req, res) => {
  const themePreviewId = req.params.themePreviewId;

  try {
    const themePreview = await _Themepreview.default.findOne({
      _id: themePreviewId
    });
    res.json(themePreview);
  } catch (error) {
    res.status(500).json({
      errors: error
    });
    console.error(error);
  }
});
var _default = router;
exports.default = _default;