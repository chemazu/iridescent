"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _expressValidator = require("express-validator");

var _multer = _interopRequireWildcard(require("multer"));

var _Product = _interopRequireDefault(require("../models/Product"));

var _School = _interopRequireDefault(require("../models/School"));

var _Tutor = _interopRequireDefault(require("../models/Tutor"));

var _User = _interopRequireDefault(require("../models/User"));

var _Sections = _interopRequireDefault(require("../models/Sections"));

var _PaymentPlans = _interopRequireDefault(require("../models/PaymentPlans"));

var _auth = _interopRequireDefault(require("../middleware/auth"));

var _validateUserPayment = _interopRequireDefault(require("../middleware/validateUserPayment"));

var _dataUri = _interopRequireDefault(require("../utilities/dataUri"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();

const storageDest = (0, _multer.memoryStorage)();
const checkProductThumbnail = (0, _multer.default)({
  storage: storageDest,

  fileFilter(req, file, cb) {
    // check if the thumbnail is an image
    if (file.fieldname === "thumbnail") {
      if (!file.originalname.match(/\.(jpg|jpeg|png|PNG|JPG|JPEG)$/)) {
        return cb(new Error("The uploaded thumbnail is not a valid image."));
      }
    } // check if the product is a valid file type
    else if (file.fieldname === "product") {
        if (!file.originalname.match(/\.(pdf|epub|mobi|azw|csv|docx|xlsx|pptx|mp3|jpg|png|gif)$/)) {
          return cb(new Error("The uploaded product is not a valid file type."));
        }
      }

    cb(undefined, true);
  }

});

const uploadFileToCloudinary = (file, options) => {
  return new Promise((resolve, reject) => {
    _cloudinary.default.v2.uploader.upload(file, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

router.post("/:schoolId", [_auth.default, _validateUserPayment.default, checkProductThumbnail.fields([{
  name: "thumbnail",
  maxCount: 1
}, {
  name: "product",
  maxCount: 1
}]), (0, _expressValidator.body)("title", "title is required").not().isEmpty(), (0, _expressValidator.body)("subtitle", "subtitle is required").not().isEmpty(), (0, _expressValidator.body)("category", "category is required").not().isEmpty(), (0, _expressValidator.body)("description", "description is required").not().isEmpty(), (0, _expressValidator.body)("language", "language is required").not().isEmpty(), (0, _expressValidator.body)("price", "price is required").not().isEmpty(), (0, _expressValidator.body)("thumbnail", "thumbnail is required").not().isEmpty()], async (req, res) => {
  const errors = (0, _expressValidator.validationResult)(req.body);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  if (req.body.price < 2000) {
    return res.status(400).json({
      errors: [{
        msg: "invalid product price"
      }]
    });
  }

  const {
    title,
    subtitle,
    category,
    description,
    language,
    price,
    tutorEmail
  } = req.body;
  const schoolId = req.params.schoolId;
  const userId = req.user.id;
  let foundTutor = null;

  try {
    const validUser = await _User.default.findOne({
      _id: userId
    });

    if (!validUser) {
      return res.status(404).json({
        msg: "user not found"
      });
    }

    let school = await _School.default.findOne({
      _id: schoolId
    });

    if (!school) {
      return res.status(400).json({
        errors: [{
          msg: "school not found"
        }]
      });
    }

    if (tutorEmail) {
      foundTutor = await _Tutor.default.findOne({
        email: tutorEmail
      });
    }

    const userPaymentPlan = await _PaymentPlans.default.findOne({
      // get infomation on the users payment plan and what he can have access to.
      _id: validUser.selectedplan
    });
    const productCount = await _Product.default.countDocuments({
      // to get the count of courses the user has created
      author: validUser._id
    });

    if (userPaymentPlan.productcount === productCount) {
      return res.status(402).json({
        message: "upgrade your plan to upload more products!"
      });
    }

    const fileType = `.${req.files.product[0].mimetype.split("/")[req.files.product[0].mimetype.split("/").length - 1]}`;
    const imgFileType = `.${req.files.thumbnail[0].mimetype.split("/")[req.files.thumbnail[0].mimetype.split("/").length - 1]}`;
    const imageToBeUploaded = (0, _dataUri.default)(`${imgFileType}`, req.files.thumbnail[0].buffer).content;
    const productToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.files.product[0].buffer).content;
    const uploads = [{
      file: imageToBeUploaded,
      options: {
        folder: `tuturly/product/${title}`,
        resource_type: "image"
      }
    }, {
      file: productToBeUploaded,
      options: {
        folder: `tuturly/product/${title}/file`,
        resource_type: "auto"
      }
    }];
    const [imageUploadResponse, productUploadResponse] = await Promise.all(uploads.map(upload => {
      const {
        file,
        options
      } = upload;
      return uploadFileToCloudinary(file, options);
    }));
    const product = new _Product.default({
      title,
      subtitle,
      category,
      description,
      language,
      price,
      thumbnail: imageUploadResponse.secure_url,
      productthumbnailid: imageUploadResponse.public_id,
      file: productUploadResponse.secure_url,
      file_public_id: productUploadResponse.public_id,
      file_size: productUploadResponse.bytes,
      file_type: fileType,
      author: validUser._id,
      school: schoolId,
      tutor: foundTutor !== null ? foundTutor._id : null
    });
    await product.save(); // code to check if user has an existing product display section
    // or create a new one

    const validSection = await _Sections.default.findOne({
      name: "productlist",
      userId: userId
    }); // if user does not have existing section then create one

    if (!validSection) {
      const getLastSection = await _Sections.default.find({
        userId: userId
      }).sort({
        position: -1
      }).limit(1);
      const sectionsObject = {
        name: "productlist",
        position: getLastSection[0].position + 1,
        userId: userId,
        schoolId: schoolId,
        parenttheme: getLastSection[0].parenttheme,
        isusingsecondarystyles: false,
        issystemcreatedsection: true,
        canberepositioned: true
      };
      const newSection = new _Sections.default(sectionsObject);
      await newSection.save();
    }

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/school/:schoolId", _auth.default, async (req, res) => {
  try {
    const products = await _Product.default.find({
      school: req.params.schoolId
    }).populate("author");
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});
router.get("/:productId", async (req, res) => {
  try {
    const product = await _Product.default.findById(req.params.productId).populate("author");
    return res.json(product);
  } catch (error) {
    throw new Error(error);
  }
}); // code to check if user plan can create new Product
// when create new Product button is clicked

router.get("/user/createproduct", _auth.default, async (req, res) => {
  const userId = req.user.id;

  try {
    const validUser = await _User.default.findOne({
      _id: userId
    });
    const userPaymentPlan = await _PaymentPlans.default.findOne({
      // get infomation on the users payment plan and what he can have access to.
      _id: validUser.selectedplan // the user's subscription plans

    });
    const productCount = await _Product.default.countDocuments({
      // to get the count of products the user has created
      author: userId
    });

    if (userPaymentPlan.coursecount === productCount) {
      return res.status(402).json({
        message: "upgrade your plan to upload more courses!"
      });
    }

    res.status(200).send("done.");
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); // update product by id

router.put("/detail/:productId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const productId = req.params.productId;

  try {
    let product = await _Product.default.findOne({
      _id: productId
    }).populate("author");

    if (!product) {
      return res.status(404).json({
        errors: [{
          msg: "product not found"
        }]
      });
    }

    const {
      title,
      subtitle,
      category,
      description,
      language,
      level,
      thumbnail,
      price
    } = req.body;
    if (title) product.title = title;
    if (subtitle) product.subtitle = subtitle;
    if (category) product.category = category;
    if (description) product.description = description;
    if (language) product.language = language;
    if (level) product.level = level;
    if (thumbnail) product.thumbnail = thumbnail;
    if (price) product.price = price;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
});
router.delete("/:productId", _auth.default, async (req, res) => {
  try {
    const product = await _Product.default.findByIdAndDelete(req.params.productId);

    if (!product) {
      return res.status(404).json({
        msg: "Product not found"
      });
    }

    await _cloudinary.default.v2.uploader.destroy(product.file_public_id);
    await _cloudinary.default.v2.uploader.destroy(product.productthumbnailid);
    return res.json({
      msg: "Product deleted"
    });
  } catch (error) {
    throw new Error(error);
  }
}); // route to update publish status of product by id

router.put("/publish/:productId", _auth.default, _validateUserPayment.default, async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await _Product.default.findOne({
      _id: productId
    }).populate("author");

    if (!product) {
      return res.status(404).json({
        errors: [{
          msg: "product not found"
        }]
      });
    }

    product.published = !product.published;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).send("server error");
    console.error(error);
  }
}); //   route to update product file

router.put("/:productId", [_auth.default, _validateUserPayment.default, checkProductThumbnail.fields([{
  name: "productFile",
  maxCount: 1
}])], async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  try {
    const product = await _Product.default.findOne({
      _id: productId,
      author: userId
    }).populate("author");

    if (!product) {
      return res.status(404).json({
        msg: "product not found"
      });
    }

    const fileType = `.${req.files.productFile[0].mimetype.split("/")[req.files.productFile[0].mimetype.split("/").length - 1]}`;
    const productFileToBeUploaded = (0, _dataUri.default)(`${fileType}`, req.files.productFile[0].buffer).content;
    const [productUploadResponse] = await Promise.all([uploadFileToCloudinary(productFileToBeUploaded, {
      folder: `tuturly/product/${product.title}/file`,
      resource_type: "auto"
    })]); // delete old file from cloudinary

    await _cloudinary.default.v2.uploader.destroy(product.file_public_id); // update db with new source

    product.file = productUploadResponse.secure_url;
    product.file_public_id = productUploadResponse.public_id;
    product.file_size = productUploadResponse.bytes;
    product.file_type = fileType; // save

    await product.save(); // return to client

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}); //   route to update product thumbnail

router.put("/thumbnail/:productId", [_auth.default, _validateUserPayment.default, checkProductThumbnail.fields([{
  name: "thumbnail",
  maxCount: 1
}])], async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  try {
    const product = await _Product.default.findOne({
      _id: productId,
      author: userId
    }).populate("author");

    if (!product) {
      return res.status(404).json({
        msg: "product not found"
      });
    }

    const imgFileType = `.${req.files.thumbnail[0].mimetype.split("/")[req.files.thumbnail[0].mimetype.split("/").length - 1]}`;
    const thumbnailToBeUploaded = (0, _dataUri.default)(`${imgFileType}`, req.files.thumbnail[0].buffer).content;
    const [thumbnailUploadResponse] = await Promise.all([uploadFileToCloudinary(thumbnailToBeUploaded, {
      folder: `tuturly/product/${product.title}`,
      resource_type: "auto"
    })]); // delete old file from cloudinary

    await _cloudinary.default.v2.uploader.destroy(product.productthumbnailid); // update db with new source

    product.thumbnail = thumbnailUploadResponse.secure_url;
    product.productthumbnailid = thumbnailUploadResponse.public_id; // save

    await product.save(); // return to client

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
var _default = router;
exports.default = _default;