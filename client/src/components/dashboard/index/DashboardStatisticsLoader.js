import React from 'react'
import { Row, Col } from 'reactstrap'
import Skeleton from 'react-loading-skeleton'

const DashboardStatisticsLoader = () => {
  return <>
    <div className="dashborad-statistics-loader">
        <Row>
            <Col className='mb-3' xs="12" sm="6" md="6" lg="12">
                <div className="dashborad-statistics-loader-item">
                <Skeleton  duration={2} height={"100%"} width={"100%"} />
                </div>
            </Col>
            <Col className='mb-3' xs="12" sm="6" md="6" lg="12">
                <div className="dashborad-statistics-loader-item">
                <Skeleton  duration={2} height={"100%"} width={"100%"} />
                </div>
            </Col> 
            <Col className='mb-3' xs="12" sm="6" md="6" lg="12">
                <div className="dashborad-statistics-loader-item">
                <Skeleton  duration={2} height={"100%"} width={"100%"} />
                </div>
            </Col>
            <Col className='mb-3' xs="12" sm="6" md="6" lg="12">
                <div className="dashborad-statistics-loader-item">
                <Skeleton  duration={2} height={"100%"} width={"100%"} />
                </div>
            </Col>
        </Row>
    </div>
  </>
}

export default DashboardStatisticsLoader
