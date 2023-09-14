import React from 'react'
import { Modal, Spinner } from 'reactstrap'

const FinalizingVideoUploadModal = ({
    isOpen
}) => {
    return <>
    <Modal
        isOpen={isOpen}
        className="modal-dialog-centered app-loader"
     >
       <div className="modal-body">
        <div className="spinner-style">
        <Spinner color="dark" style={{ width: '5rem', height: '5rem', borderWidth:"7px" }} />
        </div>
           <p className="lead text-center loader-text">Finalizing Video Upload...</p>
       </div>
    </Modal>
    </>
}

export default FinalizingVideoUploadModal
