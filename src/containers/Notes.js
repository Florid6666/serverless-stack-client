import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import { s3Upload } from "../libs/awsLib";
import "./Notes.css";
import { onError } from "../libs/errorLib";

export default function Notes() {
  const file = useRef(null);
  const { id } = useParams();
  const history = useHistory();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function loadNote() {
      return API.get("notes", `/notes/${id}`);
    }

    async function onLoad() {
      try {
        const note = await loadNote();
        const { content, attachment } = note;

        if (attachment) {
          note.attachmentURL = await Storage.vault.get(attachment);
        }

        setContent(content);
        setNote(note);
      } catch (e) {
        onError(e);
        setError("Failed to load the note. Please try again.");
      }
    }

    onLoad();
  }, [id]);

  function saveNote(note) {
    return API.put("notes", `/notes/${id}`, {
      body: note,
    });
  }

  async function handleSubmit(event) {
    let attachment;
    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000} MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      }

      await saveNote({
        content,
        attachment: attachment || note.attachment,
      });

      history.push("/");
    } catch (e) {
      onError(e);
      setError("Failed to save the note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function deleteNote() {
    return API.del("notes", `/notes/${id}`);
  }

  async function handleDelete(event) {
    event.preventDefault();

    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteNote();
      history.push("/");
    } catch (e) {
      onError(e);
      setError("Failed to delete the note. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  function validateForm() {
    return content.length > 0;
  }

  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  function isImageFile(url) {
    return /\.(jpg|jpeg|png|gif|bmp)$/i.test(url);
  }

  return (
    <div className="Notes">
      {note ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="content">
            <Form.Control
              as="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={error ? "error-input" : ""}
            />
          </Form.Group>
          <Form.Group controlId="file">
            <Form.Label>Attachment</Form.Label>
            {note.attachment && (
              <div className="attachment-preview">
                {isImageFile(note.attachmentURL) ? (
                  <img
                    src={note.attachmentURL}
                    alt="Attachment"
                    className="attachment-image"
                  />
                ) : (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={note.attachmentURL}
                  >
                    {note.attachment}
                  </a>
                )}
              </div>
            )}
            <Form.Control onChange={handleFileChange} type="file" />
          </Form.Group>
          {error && <div className="error-message">{error}</div>}
          <LoaderButton
            block
            size="lg"
            type="submit"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Save
          </LoaderButton>
          <LoaderButton
            block
            size="lg"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </LoaderButton>
        </Form>
      ) : (
        <div className="error-message">{error || "Loading..."}</div>
      )}
    </div>
  );
}
