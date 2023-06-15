import React from 'react'
import { Modal, Row, Col, Progress } from 'reactstrap'

const VideoUploadProgressModal = ({
    isOpen,
    loaded
}) => {
    return <>
        <Modal 
          isOpen={isOpen}
          centered
        >
            <div className="modal-header">
              <div style={{
                fontWeight:'700',
                fontSize:'20',
                color:'#242121',
                textTransform:'uppercase'
                }}>
                Uploading Video File.
              </div>
            </div>
            <div className="modal-body">
            <Row>
             <Col sm="12" md="12">
                <div className="course-thumbnail-upload-progress">
                <p 
                style={{
                  color:'#242121',
                  fontSize:'16px',
                  fontWeight:'600'
                }}
                className="lead text-center">Upload Progress...</p>
                {
                <Progress striped 
                color='#242121'
                max="100" style={{
                    backgroundColor:'#ffffff'
                    }} value={loaded}>
                    {
                    Math.round(loaded, 2)
                    }%
                </Progress>
                }
                </div>
                </Col>
             </Row>
            </div>
        </Modal>
    </>
}

export default VideoUploadProgressModal
