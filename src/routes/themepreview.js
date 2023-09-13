import express from "express"
import { body, validationResult } from "express-validator"
import Themepreview from "../models/Themepreview"
import auth from '../middleware/auth'

const router = express.Router()

// route to create a new theme previewer
router.post('/', [
    body("name", "name is required").not().isEmpty(),
    body("thumbnail", "thumbnail url is required").not().isEmpty(),
    body('primarybackgroundcolor', 'primary background color required').not().isEmpty(),
    body('primarytextcolor', 'primary text color required').not().isEmpty(),
    body('secondarybackgroundcolor', 'secondarybackgroundcolor is required').not().isEmpty(),
    body('secondarypagebackgroundcolor', 'secondary pages background colour required').not().isEmpty(),
    body('secondarytextcolor', 'secondarytextcolor is required').not().isEmpty(),
    body('fontfamily', 'font family is required').not().isEmpty(),
    body('buttonbackgroundcolor', 'buttonbackgroundcolor is required').not().isEmpty(),
    body('buttontextcolor', 'buttontextcolor is required').not().isEmpty(),
    body('buttonborderradius', 'buttonborderradius is required').not().isEmpty(),
    body('coursecardbackgroundcolor', 'coursecardbackgroundcolor is required').not().isEmpty(),
    body('coursecardtextcolor', 'coursecardtextcolor is required').not().isEmpty(),
    body('navbarbackgroundcolor', 'navbar background color is required').not().isEmpty(),
    body('navbartextcolor', 'navbar text color is required').not().isEmpty(),
    body('buttonaltbackgroundcolor', 'button alternate background color required').not().isEmpty(),
    body('buttonalttextcolor', 'button alternate text color required').not().isEmpty(),
    body('requiredsetions', 'required section is required').not().isEmpty(), // required sections, an array of section name
    // used to loop through and create default themes for a new theme when that theme is created or selected
    body('footertextcolor', 'footer text color required').not().isEmpty(),
    body('footerbackgroundcolor', 'footer background color is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    const { name, thumbnail, 
        primarybackgroundcolor, primarytextcolor, secondarybackgroundcolor,
        secondarytextcolor, secondarypagebackgroundcolor, fontfamily, buttonbackgroundcolor,
        buttontextcolor, buttonborderradius, coursecardbackgroundcolor,
        footertextcolor, footerbackgroundcolor,
        buttonaltbackgroundcolor, buttonalttextcolor,
        coursecardtextcolor, navbarbackgroundcolor, navbartextcolor, requiredsetions,
        // defaults assets
        defaultgalleryimage1, defaultgalleryimage2, defaultgalleryimage3, defaultcalltoactionheroimage,
        defaultimageandtextimage, defaultimageandtextimagealt, defaultheadertextandimage,
        defaultheaderheroimage
    } = req.body
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
        }

        const defaultImageAssets = {
            defaultgalleryimage1,
            defaultgalleryimage2,
            defaultgalleryimage3,
            defaultcalltoactionheroimage,
            defaultimageandtextimage,
            defaultimageandtextimagealt,
            defaultheadertextandimage,
            defaultheaderheroimage
        }

        const newThemePreviewer = new Themepreview({
            name,
            thumbnail,
            requiredsetions,
            themedefaultstyles: themedefaultStyles,
            defaultassets: defaultImageAssets
        })

        await newThemePreviewer.save()
        res.json(newThemePreviewer)
    } catch (error) {
        res.status(500).json({
            errors: error
        })
        console.error(error)
    }
})

router.get('/', async (req, res) => {
    try {
        const themepreviewList = await Themepreview.find().sort('name')
        res.json(themepreviewList)
    } catch (error) {
        res.status(500).json({
            errors: error
        })
        console.error(error)
    }
})

router.get('/:themePreviewId', auth, async (req, res) => {
    const themePreviewId = req.params.themePreviewId
    try {
        const themePreview = await Themepreview.findOne({
            _id: themePreviewId
        })
        res.json(themePreview)
    } catch (error) {
        res.status(500).json({
            errors: error
        })
        console.error(error)
    }
})

export default router