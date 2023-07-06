import mongoose from "mongoose"

const notificationsUpdateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    count: {
        type: Number
    },
    inView: {
        type: Boolean,
        default: false
    }
})

const NotificationUpdate = mongoose.model('notificationupdate', notificationsUpdateSchema)

export default NotificationUpdate