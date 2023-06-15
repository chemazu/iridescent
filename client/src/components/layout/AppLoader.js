import React from "react"
import { connect } from "react-redux"
import { Modal, Spinner } from "reactstrap"

const Apploader = ({ loading }) => {
    return <>
        <Modal
           className="modal-dialog-centered app-loader"
           isOpen={loading}
         >
          <div className="modal-body">
          <div className="spinner-style">
           <Spinner color="dark" style={{ width: '5rem', height: '5rem', borderWidth:"7px" }} />
           </div>
           <p className="lead text-center loader-text">Loading...</p>
          </div>
         </Modal>
    </>
}

const mapStateToProps = (state) => ({
    loading: state.loading.isLoading
})

export default connect(mapStateToProps)(Apploader)