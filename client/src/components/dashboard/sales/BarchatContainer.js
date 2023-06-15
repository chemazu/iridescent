import React from 'react'
import Barchat from './Barchat'

const BarchatContainer = ({
    labels,
    datas
}) => {
    return <>
        <div className="barchat-contents mt-6">
            <Barchat
              labels={labels}
              datas={datas}
            />
        </div>
    </>
}

export default BarchatContainer
