import React from 'react'
import Skeleton from 'react-loading-skeleton'


const PaymentHistoryLoader = () => {
  return <>
    <div className="payment-history-loader">
       <div className="payment-history-loader-header">
         <Skeleton  duration={2} height={"100%"} width={"100%"} />
       </div>
       <div className="payment-history-loader-item">
        <Skeleton  duration={2} height={"100%"} width={"100%"} />
       </div>
       <div className="payment-history-loader-item">
        <Skeleton  duration={2} height={"100%"} width={"100%"} />
       </div>
       <div className="payment-history-loader-item">
        <Skeleton  duration={2} height={"100%"} width={"100%"} />
       </div>
    </div>
  </>
}

export default PaymentHistoryLoader
