import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import { API, Storage } from "aws-amplify";
import "./Home.css";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
      try {
        const notes = await loadNotes();
        const notesWithImages = await Promise.all(
          notes.map(async (note) => {
            if (note.attachment) {
              try {
                note.attachmentURL = await Storage.vault.get(note.attachment);
              } catch {
                note.attachmentURL = "/default-placeholder.png"; // Default image on error
              }
            } else {
              note.attachmentURL = "/default-placeholder.png"; // Default image if no attachment
            }
            return note;
          })
        );
        setNotes(notesWithImages);
      } catch (e) {
        onError(e);
      }
      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function loadNotes() {
    return API.get("notes", "/notes");
  }

  function renderNotesList(notes) {
    return (
      <>
        <LinkContainer to="/notes/new">
          <ListGroup.Item action className="notes-new-item">
            <BsPencilSquare size={17} className="notes-icon" />
            <span className="notes-new-text">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {notes.map(({ noteId, content, createdAt, attachmentURL }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action className="notes-item d-flex align-items-left">
              <img
                src={attachmentURL}
                alt="Note"
                className="note-thumbnail"
                onError={(e) => (e.target.src = "/default-placeholder.png")} // Fallback for broken images
              />
              <div className="note-content">
                <span className="notes-title">
                  {content.trim().split("\n")[0]}
                </span>
                <br />
                <span className="notes-date">
                  Created: {new Date(createdAt).toLocaleString()}
                </span>
              </div>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
        <div className="actions">
          <LinkContainer to="/login">
            <button className="btn btn-primary btn-lg mt-3">Get Started</button>
          </LinkContainer>
        </div>
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
        <ListGroup>{!isLoading && renderNotesList(notes)}</ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
