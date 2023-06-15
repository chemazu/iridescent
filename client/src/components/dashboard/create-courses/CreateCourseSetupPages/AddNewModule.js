import React from 'react'
import { Button } from 'reactstrap'

export const AddNewModule = ({ openModalDialog }) => {
    return <>
        <div className="text-center modules-container__no-module">
            <div className="no-modules-text">
                <h4>0 Module(s)</h4>
                 <hr className="no-text__hr" />
            </div>
            <div className="add-module__button mt-6">
                <Button onClick={openModalDialog}>Click To Add a New Module</Button>
            </div>
        </div>
    </>
}

export default AddNewModule