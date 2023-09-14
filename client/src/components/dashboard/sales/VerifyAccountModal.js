import React from 'react'
import { Modal, Spinner } from "reactstrap"

const VerifyAccountModal = ({
    loading,
    toggleVerifyAccountLoading,
    verifiedAccountName
}) => {
    return <>
        <Modal
           className="modal-dialog-centered app-loader"
           isOpen={loading}
           centered
           toggle={toggleVerifyAccountLoading}
         >
             <div className="modal-header" 
             style={{
                display:'flex',
                justifyContent:'space-between',
                alignContent:'baseline'
             }}
             >
             <h5 className='add-account-modal__header'>Verifying Account Details</h5>
             <div onClick={toggleVerifyAccountLoading} className="header-modal-clsoe-btn">
                <i className="fas fa-times"></i>
            </div>
             </div>
            <div className="modal-body">
              {
             verifiedAccountName.length === 0 ? <>
            <div className="spinner-style">
            <Spinner color="dark" style={{ width: '5rem', height: '5rem', borderWidth:"7px" }} />
            </div>
            <p style={{
                color:'#000',
                fontWeight:'500',
                textTransform:'uppercase',
                fontSize:'19px'
            }} className="lead text-center loader-text">Verifying Account Details...</p>
                  </> : <>
                    <p className='lead text-center'>Account Name: {verifiedAccountName}</p>
                  </>
              }
          </div>
        </Modal>
    </>
}

export default VerifyAccountModal
