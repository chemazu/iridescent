import React from 'react'
import MessagesItem from './MessagesItem'

const MessagesContainer = () => {
    return <>
    <div className="message-container">
        <MessagesItem messageName="Jamal"
         messageFirstName="J"
         message="Good evening sir"
         counter={3} />
        <MessagesItem  messageName="Jamal"
         messageFirstName="T"
         message="Toluani"
         counter={1} />
        <MessagesItem 
         messageName="Benedict" 
         messageFirstName="B"
         message="Hello Boss"
         counter={2} />
    </div>
    </>
}

export default MessagesContainer
