import express from 'express'
import NotificationUpdate from '../models/NotificationUpdate'
import auth from '../middleware/auth'

const router = express.Router()

// route to read user notification update
// it also create's on just for user's that don't have 
// a notifications update already...
router.get('/', auth, async (req, res) => {
    const userId = req.user.id
    try {
        const notificationupdate = await NotificationUpdate.findOne({
            user: userId
        })

    if(notificationupdate === null){
        const newNotificationUpdate = new NotificationUpdate({
            user: userId,
            count: 0,
            inView: false
        })

        await newNotificationUpdate.save()
        return res.json(newNotificationUpdate)
     }

     res.json(notificationupdate)

    } catch (error) {
        res.status(500).json({
            errors: error
        })
        console.error(error)
    }
})

// route to update notification update
// when notification page displays
// changes the inView prop to false 
router.put('/', auth, async (req, res) => {
    const userId = req.user.id
    try {
        const notificationUpdate = await NotificationUpdate.findOne({
            user: userId
        })

        notificationUpdate.inView = false
        notificationUpdate.count = 0
        
        await notificationUpdate.save()
        res.json(notificationUpdate)

    } catch (error) {
        res.status(500).json({
            errors: error
        })
        console.error(error)
    }
})

export default router