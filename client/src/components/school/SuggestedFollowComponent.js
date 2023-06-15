import React from 'react'
import SuggestedFollowUpItem  from './SuggestedFollowUpItem'

import '../../custom-styles/pages/components/suggestedfollowup.css'

export const SuggestedFollowComponent = () => {
    return <>
        <div className="suggested-followup-container">
             <div className="header-title">
                Suggested Follow Up
            </div>
            <div className="followup-item__container">
                <SuggestedFollowUpItem />
                <SuggestedFollowUpItem />
                <SuggestedFollowUpItem />
                <SuggestedFollowUpItem />
                <SuggestedFollowUpItem />
            </div>
        </div>
    </>
}

export default SuggestedFollowComponent
