import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
// import 'react-loading-skeleton/lib/skeleton.css'

import '../../custom-styles/pages/components/videoplayerskeleton.css'

const VideoPlayerSkeleton = () => {
    return <>
        <div className="videoplayer-skeleton">
            <SkeletonTheme
             color="#272727"
             highlightColor="#3d3c3c"
             >
            <Skeleton 
             baseColor="#000"
            duration={2.4} height="80vh" width="95%" /> 
          </SkeletonTheme>
        </div>
    </>
}

export default VideoPlayerSkeleton
