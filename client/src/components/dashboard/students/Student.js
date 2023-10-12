import React, { useState, useEffect, useCallback, useRef } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { Col, Container, Row, Table } from "reactstrap";
import { useAlert } from "react-alert";
import DashboardNavbar from "../DashboardNavbar";
import NotificationNavbar from "../NotificationNavbar";
import StudentDataItem from "./StudentDataItem";
import { UPDATE_DASHBOARD_PAGE_COUNTER } from "../../../actions/types";

import "../../../custom-styles/dashboard/dashboardlayout.css";
import "../../../custom-styles/dashboard/students.css";

const Student = ({ school }) => {
  const alert = useAlert();
  const dispatch = useDispatch();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();
  const uniquebyID = (array) => {
    return [...new Map(array.map((item) => [item["_id"], item])).values()];
  };

  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((page) => {
            return page + 1;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading]
  );

  const getStudentsData = async () => {
    try {
      const res = await axios.get(
        `/api/v1/student/list/${school._id}?page=${page}&size=10`
      );
      setStudents((prevStudents) => {
        return [...new Set([...prevStudents, ...res.data])];
      });
      setHasMore(res.data.length > 0);
      setLoading(false);
    } catch (error) {
      setStudents([]);
      setLoading(false);
      alert.show(error, {
        type: "error",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    if (school) {
      getStudentsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school, page]);

  useEffect(() => {
    dispatch({ type: UPDATE_DASHBOARD_PAGE_COUNTER, payload: 183 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-layout">
      <Container fluid>
        <Row>
          <DashboardNavbar />
          <Col className="page-actions__col">
            <div className="page-actions">
              <NotificationNavbar />
              <div className="manage-students-page">
                <div className="manage-students-page__contents">
                  <div className="page-title">
                    <div className="page-title__text">Manage Students</div>
                  </div>
                  {loading === false ? (
                    <div className="students-data__container mb-2">
                      <Table
                        className="enrolled-students__table align-items-center table-flush"
                        responsive
                      >
                        <thead className="enrolled-students__table-header">
                          <tr>
                            <th>Date Enrolled.</th>
                            <th>Name</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.length === 0 ? (
                            <p className="text-center small mt-2">
                              No Enrolled Students
                            </p>
                          ) : (
                            <>
                              {uniquebyID(students).map((student, index) => {
                                if (students.length === index + 1) {
                                  return (
                                    <StudentDataItem
                                      refVariable={lastBookElementRef}
                                      key={student._id}
                                      student={student}
                                    />
                                  );
                                } else {
                                  return (
                                    <StudentDataItem
                                      key={student._id}
                                      student={student}
                                    />
                                  );
                                }
                              })}
                            </>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center lead">Loading...</p>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => ({
  school: state.school.schoolDetails,
});

export default connect(mapStateToProps)(Student);
