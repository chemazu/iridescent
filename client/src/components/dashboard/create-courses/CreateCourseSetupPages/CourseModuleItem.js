import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import axios from "axios";
import { useAlert } from "react-alert";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  UncontrolledTooltip,
} from "reactstrap";
import { updateModule, deleteModule } from "../../../../actions/modules";
import { REMOVE_COURSE_UNIT_FROM_MODULE } from "../../../../actions/types";
import CourseVideoItem from "./CourseVideoItem";
import setAuthToken from "../../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../../actions/appLoading";

export const CourseModuleItem = ({
  module,
  openUploadCourseContentModal,
  update,
  deleteCourseModule,
}) => {
  const [moduleNameUpdate, setModuleNameUpdate] = useState(module.name);
  const handleModuleNameInput = (e) => setModuleNameUpdate(e.target.value);

  const dispatch = useDispatch();

  const alert = useAlert();

  const [couseUnit, setCourseUnit] = useState([]);

  const [openModuleUpdateModal, setOpenModuleUpdateModal] = useState(false);
  const [deleteModuleModal, setDeleteModuleModal] = useState(false);

  const openUpdate = () => setOpenModuleUpdateModal(true);
  const closeUpdate = () => setOpenModuleUpdateModal(false);

  const openDeleteModal = () => setDeleteModuleModal(true);
  const closeDeleteModal = () => setDeleteModuleModal(false);

  const updateModule = () => {
    update({ name: moduleNameUpdate }, module._id);
    closeUpdate();
  };

  const deleteModule = () => {
    deleteCourseModule(module._id);
    closeDeleteModal();
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(couseUnit);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCourseUnit(items);
    const reArrangedArraysToBeSent = items.map((item, index) => ({
      ...item,
      index,
    }));
    orderUnitListAfterDragEnd(reArrangedArraysToBeSent);
  };

  const orderUnitListAfterDragEnd = async (list) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        list,
      });
      await axios.put(`/api/v1/courseunit/${module._id}/reorder`, body, config);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
    }
  };

  const handleDeleteVideoUnitClick = async (courseUnitId) => {
    try {
      if (localStorage.getItem("token")) {
        setAuthToken(localStorage.getItem("token"));
      }
      dispatch(startLoading());
      const res = await axios.delete(
        `/api/v1/courseunit/${courseUnitId}/${module.course}`
      );
      dispatch({
        type: REMOVE_COURSE_UNIT_FROM_MODULE,
        payload: res.data,
      });
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      const errors = error?.response?.data?.errors;
      if (errors) {
        errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
        alert.show(error.message, {
          type: "error",
        });
      }
    }
  };

  useEffect(() => {
    let units = Array.from(module.courseunit);
    units.sort((a, b) => {
      return a.position - b.position;
    });

    setCourseUnit(units);
    // module.courseunit.forEach((item) => console.log(item.position, 'position'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let units = Array.from(module.courseunit);
    units.sort((a, b) => {
      return a.position - b.position;
    });

    setCourseUnit(units);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  return (
    <>
      <div className="course-module__item">
        <h4>{module.name}</h4>
        <hr className="moduleItem__hr" />
        <i
          onClick={(e) => openUploadCourseContentModal(module._id, module.name)}
          href="#"
          id="UncontrolledTooltipForUplaodVideo"
          className="fas fa-file-video"
        ></i>
        <UncontrolledTooltip
          placement="bottom"
          target="UncontrolledTooltipForUplaodVideo"
        >
          Upload Course Content.
        </UncontrolledTooltip>
        <i
          onClick={openUpdate}
          className="fas fa-edit"
          href="#"
          id="UncontrolledTooltipForUpdateModuleName"
        ></i>
        <UncontrolledTooltip
          placement="bottom"
          target="UncontrolledTooltipForUpdateModuleName"
        >
          Edit module name.
        </UncontrolledTooltip>
        <i
          onClick={openDeleteModal}
          href="#"
          id="UncontrolledTooltipForDeleteModule"
          className="fas fa-trash-alt"
        ></i>
        <UncontrolledTooltip
          placement="bottom"
          target="UncontrolledTooltipForDeleteModule"
        >
          Delete module.
        </UncontrolledTooltip>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`${module._id}`}>
          {(provided) => {
            return (
              <>
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {couseUnit.length === 0 ? (
                    <div className="no-video-message lead">
                      You have no lessons in this module
                    </div>
                  ) : (
                    <>
                      {couseUnit.map((unit, index) => (
                        <Draggable
                          key={unit._id}
                          draggableId={unit._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <CourseVideoItem
                                key={unit._id}
                                courseUnit={unit}
                                handleDeleteVideoUnitClick={
                                  handleDeleteVideoUnitClick
                                }
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </>
                  )}
                  {provided.placeholder}
                </div>
              </>
            );
          }}
        </Droppable>
      </DragDropContext>
      <Modal centered isOpen={openModuleUpdateModal}>
        <div
          style={{
            fontWeight: "700",
            fontSize: "20",
            color: "#242121",
            textTransform: "uppercase",
          }}
          className="modal-header"
        >
          Update Module
        </div>
        <ModalBody>
          <Input
            type="text"
            className=""
            placeholder="update module name"
            value={moduleNameUpdate}
            onChange={(e) => handleModuleNameInput(e)}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            className="modal-btn-style-outline"
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            onClick={closeUpdate}
          >
            Cancel
          </Button>{" "}
          <Button
            className="modal-btn-style"
            onClick={updateModule}
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
          >
            Update
          </Button>
        </ModalFooter>
      </Modal>

      <Modal centered isOpen={deleteModuleModal}>
        <div
          style={{
            fontWeight: "700",
            fontSize: "20",
            color: "#242121",
            textTransform: "uppercase",
          }}
          className="modal-header"
        >
          Delete Module
        </div>
        <ModalBody>
          <p className="text-center lead">
            Are you sure you want to delete this module with all it's course
            Unit's <br />
            <span
              style={{
                color: "#f5365c",
              }}
            >
              Caution
            </span>{" "}
            This cannot be changed!
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            className="modal-btn-style-outline"
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
            onClick={closeDeleteModal}
          >
            Cancel
          </Button>{" "}
          <Button
            onClick={deleteModule}
            className="modal-btn-style"
            style={{
              paddingLeft: "40px",
              paddingRight: "40px",
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  update: (updates, moduleId) => dispatch(updateModule(updates, moduleId)),
  deleteCourseModule: (moduleId) => dispatch(deleteModule(moduleId)),
});

export default connect(null, mapDispatchToProps)(CourseModuleItem);
