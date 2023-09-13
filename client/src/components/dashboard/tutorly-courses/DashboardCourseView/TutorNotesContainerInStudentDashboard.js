import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import { Button, Form, FormGroup } from "reactstrap";
import format from "../../../../utilities/format";
import setAuthToken from "../../../../utilities/setAuthToken";
import TutorNotesItem from "./TutorNotesItem";

const TutorNotesContainerInStudentDashboard = ({
  courseUnitId,
  elaspedTime,
  currentTime,
  videoJsPlayerRef,
  scrollToVideo,
  updateCourseUnitNoteCounter, // course unit note counter is used to display the
  // counter as number when the counter loads successfully
  // so the notes count can be displayed in the UI
}) => {
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [displayNoteForm, setDisplayNoteForm] = useState(false);
  const [submitNoteLoading, setSubmitFormLoading] = useState(false);
  const alert = useAlert();

  const [text, setText] = useState("");
  const [timestamp, setTimeStamp] = useState("");

  const loadNotes = async () => {
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      const res = await axios.get(`/api/v1/note/${courseUnitId}`);
      setNotes(res.data);
      setNotesLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const saveNote = async () => {
    if (text.length === 0) {
      return alert.show("text input cannot be empty", {
        type: "error",
      });
    }
    if (localStorage.getItem("studentToken")) {
      setAuthToken(localStorage.getItem("studentToken"));
    }
    try {
      setSubmitFormLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const body = JSON.stringify({
        text: text,
        timestamp: timestamp,
      });
      const res = await axios.post(
        `/api/v1/note/${courseUnitId}`,
        body,
        config
      );
      setNotes([...notes, res.data]);
      setSubmitFormLoading(false);
      setText("");
      setTimeStamp("");
      setDisplayNoteForm(false);
    } catch (error) {
      console.log(error);
      const errors = error?.response?.data?.errors;
      if (errors?.length > 0) {
        errors.forEach((element) => {
          alert.show(element.msg, {
            type: "error",
          });
        });
      }
      setSubmitFormLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      if (localStorage.getItem("studentToken")) {
        setAuthToken(localStorage.getItem("studentToken"));
      }
      const res = await axios.delete(`/api/v1/note/${courseUnitId}/${noteId}`);
      setNotes(notes.filter((note) => note._id !== res.data._id));
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDisplayNoteForm = () => {
    if (displayNoteForm === false) {
      // if the form is not displayed and we display it
      setTimeStamp(currentTime); // then save currentTime in the timestamp state
    }
    setDisplayNoteForm(!displayNoteForm);
  };

  const submitNoteForm = (e) => {
    e.preventDefault();
    saveNote();
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line
  }, [courseUnitId]);

  useEffect(() => {
    updateCourseUnitNoteCounter(notes.length);
    // eslint-disable-next-line
  }, [notes]);

  return (
    <>
      <Button onClick={toggleDisplayNoteForm} className="tutor-add-notes__btn">
        <i className="fas fa-plus mr-2"></i>Add Note @{elaspedTime}
      </Button>
      {displayNoteForm && (
        <>
          <div className="tutor-add-note__container mt-3">
            <Form onSubmit={(e) => submitNoteForm(e)}>
              <FormGroup>
                <textarea
                  id="notes-textarea-id"
                  className="form-control"
                  rows="3"
                  placeholder="Note Text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </FormGroup>
              <FormGroup>
                <Button
                  type="submit"
                  disabled={submitNoteLoading}
                  className="tutor-save-note mt-2"
                >
                  Save Note @{format(timestamp)}
                </Button>
              </FormGroup>
            </Form>
          </div>
        </>
      )}
      <div className="tutor-notes-list__container mt-4">
        {notesLoading ? (
          <p style={{ color: "#000" }} className="text-center">
            Loading...
          </p>
        ) : (
          <>
            {notes.length === 0 ? (
              <p
                style={{
                  color: "#000",
                }}
                className="text-center"
              >
                You have no Note For this unit!
              </p>
            ) : (
              <>
                {notes.map((note) => (
                  <TutorNotesItem
                    key={note._id}
                    note={note}
                    handleDeleteNote={handleDeleteNote}
                    videoJsPlayerRef={videoJsPlayerRef}
                    scrollToVideo={scrollToVideo}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TutorNotesContainerInStudentDashboard;
