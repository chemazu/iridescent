import React, { useState, useEffect } from "react";
import { useAlert } from "react-alert";
import axios from "axios";
import setAuthToken from "../../utilities/setAuthToken";
import { Button, Form, FormGroup } from "reactstrap";
import StudentDashboardNotesItem from "./StudentDashboardNotesItem";
import format from "../../utilities/format";

import "../../custom-styles/pages/components/notescontainer.css";

export const NotesContainer = ({
  courseUnitId,
  elaspedTime,
  currentTime,
  videoJsPlayerRef,
  scrollToVideo,
  theme,
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
      <Button
        style={{
          backgroundColor: theme.themestyles.buttonbackgroundcolor,
          color: theme.themestyles.buttontextcolor,
        }}
        onClick={toggleDisplayNoteForm}
        className="add-notes__btn"
      >
        <i className="fas fa-plus mr-2"></i>Add Note @{elaspedTime}
      </Button>
      {displayNoteForm && (
        <>
          <div className="add-note-container mt-3">
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
                  style={{
                    backgroundColor: theme.themestyles.buttonbackgroundcolor,
                    color: theme.themestyles.buttontextcolor,
                  }}
                  type="submit"
                  disabled={submitNoteLoading}
                  className="save-note"
                >
                  Save Note @{format(timestamp)}
                </Button>
              </FormGroup>
            </Form>
          </div>
        </>
      )}
      <div className="student-notes__container mt-4">
        {notesLoading ? (
          <>
            <p
              style={{
                color: theme.themestyles.primarytextcolor,
              }}
              className="text-center"
            >
              Loading...
            </p>
          </>
        ) : (
          <>
            {notes.length === 0 ? (
              <p
                className="text-center"
                style={{
                  color: theme.themestyles.primarytextcolor,
                }}
              >
                You Have No Note For This Unit!
              </p>
            ) : (
              <>
                {notes.map((note) => (
                  <StudentDashboardNotesItem
                    key={note._id}
                    note={note}
                    handleDeleteNote={handleDeleteNote}
                    videoJsPlayerRef={videoJsPlayerRef}
                    scrollToVideo={scrollToVideo}
                    theme={theme}
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

export default NotesContainer;
