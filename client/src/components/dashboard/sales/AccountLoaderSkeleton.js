import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

const AccountLoaderSkeleton = () => {
    return <>
         <div className="account-bar mt-2 mb-2">
            <SkeletonTheme
             color="#f2f2f2"
             highlightColor="#fff"
             >
            <Skeleton 
            duration={2.4} height="90px" width="100%" /> 
          </SkeletonTheme>
        </div>
        <div className="account-bar mt-2 mb-2">
            <SkeletonTheme
             color="#f2f2f2"
             highlightColor="#fff"
             >
            <Skeleton 
            duration={2.4} height="90px" width="100%" /> 
          </SkeletonTheme>
        </div>
        <div className="account-bar mt-2 mb-2">
            <SkeletonTheme
             color="#f2f2f2"
             highlightColor="#fff"
             >
            <Skeleton 
            duration={2.4} height="90px" width="100%" /> 
          </SkeletonTheme>
        </div>
    </>
}

export default AccountLoaderSkeleton
