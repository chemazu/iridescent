import React from 'react'
import { Modal,
    ModalBody, Spinner
} from 'reactstrap'

const WithdrawalLoadingModal = ({
    withdrawalTransactionLoadingModal,
    toggleWithdrawalTransactionModal
}) => {
    return <>
        <Modal
         isOpen={withdrawalTransactionLoadingModal}
         toggle={toggleWithdrawalTransactionModal}
         centered
        >
        <ModalBody>
          <div 
            style={{
                width:'100%',
                display:'flex',
                justifyContent:'center',
                alignItems:'center'
            }}
          className="spinner-style">
           <Spinner color="dark" style={{ width: '5rem', height: '5rem', borderWidth:"7px" }} />
         </div>
            <p className='lead text-center'>Processing Withdrawal...</p>
         </ModalBody>
        </Modal>
    </>
}

export default WithdrawalLoadingModal
