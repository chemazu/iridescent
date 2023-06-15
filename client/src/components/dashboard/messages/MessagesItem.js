import React from 'react'


const MessagesItem = ({
    messageName,
    messageFirstName,
    message,
    counter
}) => {
    return <>
        <div className="messages-item">
            <div className="messages-item__first-letter">
               {messageFirstName}
            </div>
            <div className="message-item-info">
            <div className="messages-item__recipient-details">
                <h3 className="recipient-name">
                    {messageName}
                </h3>
                <p className="recipient-message">
                    {message}
                </p>
            </div>
            <div className="messages-item__more-info">
                <div className="message-timestamp">17:35</div>
                <div className="message-unread-conuter">{counter}</div>
            </div>
            </div>
        </div>
    </>
}

export default MessagesItem
