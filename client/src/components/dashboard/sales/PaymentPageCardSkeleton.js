import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

const PaymentPageCardSkeleton = () => {
    return <>
        <div className="payment-card-loader mt-3 mb-3" style={{
            height:'120px'
        }}>
            <SkeletonTheme
                color="#f2f2f2"
                highlightColor="#fff"
                >
                <Skeleton 
                duration={2.4} height="120px" width="90%" /> 
            </SkeletonTheme>
        </div>
    </>
}

export default PaymentPageCardSkeleton
