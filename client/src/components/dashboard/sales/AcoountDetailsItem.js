import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Modal, Button } from 'reactstrap'
import { useAlert } from 'react-alert'
import axios from 'axios'
import { startLoading, stopLoading } from '../../../actions/appLoading'
import setAuthToken from '../../../utilities/setAuthToken'


const AcoountDetailsItem = ({
    account,
    deleteItemFromUserBankAccountList,
    showLoader,
    removeLoader,
}) => {

    const [ showModalConfirmation, setShowModalConfirmation ] = useState(false)
    const toggleShowModalConfirmation = () => setShowModalConfirmation(!showModalConfirmation)
    const alert = useAlert()

    const handleDeleteUIUpdate = () => {
        deleteItemFromUserBankAccountList(account._id)
    }

    const displayLastFiveCharacters = (accountNumber) => {
        return `*****${accountNumber.substr(5, 5)}`
    }

    const handleAccountDeleteClick = async () => {
        try {
            showLoader()
            if(localStorage.getItem('token')){
                setAuthToken(localStorage.getItem('token'))
            }
           await axios.delete(`/api/v1/bank/${account._id}`)
           alert.show('account deleted successfully', {
               type:'success'
           })
           handleDeleteUIUpdate()
           toggleShowModalConfirmation()
           removeLoader()
        } catch (error) {
            alert.show(error, {
                type:'error'
            })
            console.log(error)
            removeLoader()
        }
    }

    return <>
        <div className="account-details-item">
            <div className="account-details-info">
                <p className="account-name">{account.accountname}</p>
                <p className="bank-name__account-number">{displayLastFiveCharacters(account.accountnumber)} - {account.bankname} </p>
            </div>
            <div onClick={toggleShowModalConfirmation} className="account-details-action">
                <i className="fas fa-trash-alt"></i>
            </div>
        </div>
        <Modal
        isOpen={showModalConfirmation}
        toggle={toggleShowModalConfirmation}
        centered
        >
            <div className="modal-header">
                <h5>Delete Account.</h5>
            </div>
            <div className="modal-body">
                <p className='lead text-center'>Are you Sure You want to Delete this Account ?</p>
            </div>
            <div className="modal-footer">
                <Button
                 onClick={toggleShowModalConfirmation}
                 className='modal-btn-style-outline'
                 block>Cancel</Button>
                <Button
                 onClick={handleAccountDeleteClick}
                 className="modal-btn-style mb-2"
                  block>Delete</Button>
            </div>
        </Modal>
    </>
}

const mapDispatchToProps = (dispatch) => ({
    showLoader: () => dispatch(startLoading()),
    removeLoader: () => dispatch(stopLoading())
})

export default connect(null, mapDispatchToProps)(AcoountDetailsItem)
