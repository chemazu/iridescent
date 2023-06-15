import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Modal, Form, FormGroup, Input, Button, Label } from "reactstrap";
import { useAlert } from "react-alert";
import setAuthToken from "../../../utilities/setAuthToken";
import { startLoading, stopLoading } from "../../../actions/appLoading";

const ChangePasswordModal = ({
  isUpdatePasswordModalOpen,
  setUpdatePasswordModalOpen,
  setModalSuccessPrompt,
}) => {
  const [updatePasswordDetails, setUpdatePasswordDetails] = useState({
    oldpassword: "",
    newpassword: "",
    confirmpassword: "",
  });

  const alert = useAlert();
  const dispatch = useDispatch();

  const updateFormInput = (e) =>
    setUpdatePasswordDetails({
      ...updatePasswordDetails,
      [e.target.name]: e.target.value,
    });

  const { oldpassword, newpassword, confirmpassword } = updatePasswordDetails;

  const handlePasswordChangeRequest = async (formData) => {
    if (localStorage.getItem("token")) {
      setAuthToken(localStorage.getItem("token"));
    }
    try {
      dispatch(startLoading());
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify(formData);
      await axios.put("/api/v1/user/account/password/change", body, config);
      setUpdatePasswordModalOpen(false);
      dispatch(stopLoading());
      setUpdatePasswordDetails({
        oldpassword: "",
        newpassword: "",
        confirmpassword: "",
      });
      setModalSuccessPrompt(true);
    } catch (error) {
      dispatch(stopLoading());
      const errors = error?.response?.data?.errors;
      if (errors) {
        return errors.forEach((error) => {
          alert.show(error.msg, {
            type: "error",
          });
        });
      }
      alert.show(error.message, {
        type: "error",
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (oldpassword.length === 0) {
      return alert.show("old password not valid", {
        type: "error",
      });
    }

    if (newpassword.length === 0) {
      return alert.show("new password not valid", {
        type: "error",
      });
    }

    if (newpassword.length <= 6) {
      return alert.show(
        "new password length must be greater that 6 characters",
        {
          type: "error",
        }
      );
    }

    if (confirmpassword.length === 0) {
      return alert.show("confirm password not valid", {
        type: "error",
      });
    }

    handlePasswordChangeRequest({
      oldpassword,
      newpassword,
      confirmpassword,
    });
  };

  return (
    <>
      <Modal
        className="modal-dialog-centered"
        isOpen={isUpdatePasswordModalOpen}
      >
        <div className="modal-header settings-modal__header">
          <h3>Change Password</h3>
          <div
            className="settings-modal-close__btn"
            onClick={() => setUpdatePasswordModalOpen(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <div className="modal-body">
          <Form onSubmit={(e) => handleFormSubmit(e)}>
            <FormGroup>
              <Label>Old Password</Label>
              <Input
                type="password"
                placeholder="old password"
                value={oldpassword}
                name="oldpassword"
                required
                onChange={(e) => updateFormInput(e)}
              ></Input>
            </FormGroup>
            <Label>New Password</Label>
            <FormGroup>
              <Input
                type="password"
                placeholder="New Password"
                value={newpassword}
                name="newpassword"
                required
                onChange={(e) => updateFormInput(e)}
              ></Input>
            </FormGroup>
            <Label>Re-enter New Password</Label>
            <FormGroup>
              <Input
                type="password"
                placeholder="Re-enter New Password"
                value={confirmpassword}
                name="confirmpassword"
                required
                onChange={(e) => updateFormInput(e)}
              ></Input>
            </FormGroup>
          </Form>
        </div>
        <div className="modal-footer">
          <Button onClick={handleFormSubmit} block className="modal-btn-style">
            Change Password
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ChangePasswordModal;
