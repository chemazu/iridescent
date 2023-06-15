import React from 'react'
import Skeleton from 'react-loading-skeleton'

const DashboardGraphLoader = () => {
    return <>
        <div className='dashboard-graph-loader'>
            <Skeleton  duration={2} height={"100%"} width={"100%"} /> 
        </div>
    </>
}

export default DashboardGraphLoader