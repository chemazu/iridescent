import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const PaymentPlansLoadingSkeleton = () => {
  return <>
    <Container style={{
      width:'95%'
    }} fluid>
      <Row>
          <Col
          style={{
            height:'55vh'
          }}
          xs="12" sm="6" md="4" lg="4">
           <SkeletonTheme
             color="#f2f2f2"
             highlightColor="#fff"
             >
            <Skeleton 
            duration={2.4} height="55vh" width="100%" /> 
          </SkeletonTheme>
          </Col>
          <Col 
          style={{
            height:'55vh'
          }} xs="12" sm="6" md="4" lg="4">
             <SkeletonTheme
             color="#f2f2f2"
             highlightColor="#fff"
             >
            <Skeleton 
            duration={2.4} height="55vh" width="100%" /> 
          </SkeletonTheme>
          </Col>
          <Col
          style={{
            height:'55vh'
          }}
          xs="12" sm="6" md="4" lg="4">
           <SkeletonTheme
             color="#f2f2f2"
             highlightColor="#fff"
             >
            <Skeleton 
            duration={2.4} height="55vh" width="100%" /> 
          </SkeletonTheme>
          </Col>
      </Row>
    </Container>
  </>;
};

export default PaymentPlansLoadingSkeleton;
