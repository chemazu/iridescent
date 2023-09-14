import React from 'react'
import NotificationItem from './NotificationItem'

const NotificationsContainer = ({ notifications }) => {

  return <>
    <div className='notification-body'>
        {
            notifications.map((notification) => <NotificationItem key={notification._id} notification={notification} />)
        }
    </div>
  </>
}

export default NotificationsContainer
