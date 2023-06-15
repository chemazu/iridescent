import React from 'react'
// import StartRatings from "react-star-ratings"
import thumbnail from "../../images/suggestedItem-thumbnail.png"

import '../../custom-styles/pages/components/suggestedfollowupitem.css'

const SuggestedFollowUpItem = () => {
    return <>
        <div className="suggested-followup-item mb-3">
            <div className="item-img-container">
                <img src={thumbnail} alt="thumbnail img" className="img-fluid" />
            </div>
            <div className="item-name">
                Exotic Wood crafting
            </div>
            <div className="item-author-name">
                Master Yoda
            </div>
            {/* <div className="item-start-rating__container">
            <StartRatings
            isSelectable={false}
            starHoverColor="orangered"
            rating={4}
            starDimension='20px'
            isAggregateRating={true}
            starRatedColor="orange"
            numberOfStars={5}
            starSpacing='5px'
            name='rating'
            />
            </div> */}
            <div className="item-price">
                $40.99
            </div>
        </div>
    </>
}

export default SuggestedFollowUpItem