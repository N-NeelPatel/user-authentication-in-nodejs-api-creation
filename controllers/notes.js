import { v4 as uuidv4 } from "uuid";
import fs from "fs";

function addNotesToFile(noteObj) {
  return new Promise((resolve, reject) => {
    fs.readFile("notes.json", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const notes = JSON.parse(data);
      notes.notes.push(noteObj);
      fs.writeFile("notes.json", JSON.stringify(notes), (err) => {
        if (err) {
          console.error(err);
          reject("Error 500!");
          return;
        }
        resolve();
      });
    });
  });
}

function getNotesFromFileForUsers(userId) {
  return new Promise((resolve, reject) => {
    fs.readFile("notes.json", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const notes = JSON.parse(data);
      let filteredNotes = notes.notes?.filter(
        (note) => note.user_id === userId
      );
      resolve(filteredNotes);
    });
  });
}

function getNoteBasedOnId(noteId, userId) {
  return new Promise((resolve, reject) => {
    fs.readFile("notes.json", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const notes = JSON.parse(data);
      let selectedNote = notes.notes.find((note) => note.id === noteId);
      if (!selectedNote) {
        reject(`Error 404! Note with id ${noteId} doesn't exist!`);
      }
      if (selectedNote?.user_id !== userId) {
        reject("Error 403! Trying to get Note of different User");
      }
      resolve(selectedNote);
    });
  });
}

function deleteNoteBasedOnId(noteId, userId) {
  return new Promise((resolve, reject) => {
    fs.readFile("notes.json", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      let deleteFlag = false;
      let notes = JSON.parse(data);
      let existingNote = notes.notes.find((note) => note.id === noteId);
      if (!existingNote) {
        reject(`Error 404! Note with id ${noteId} doesn't exist!`);
      }
      notes.notes = notes.notes?.filter((note) => note.id !== noteId);
      fs.writeFile("notes.json", JSON.stringify(notes), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        deleteFlag = true;
        console.log(
          `Note with id ${noteId} deleted from notes.json successfully`
        );
        resolve(deleteFlag);
      });
    });
  });
}

function updateNoteWithId(noteId, userId, title, content) {
  return new Promise((resolve, reject) => {
    fs.readFile("notes.json", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      let deleteFlag = false;
      let notes = JSON.parse(data);
      let existingNote = notes.notes.find((note) => note.id === noteId);
      if (!existingNote) {
        reject(`Error 404! Note with id ${noteId} doesn't exist!`);
      }
      if (title) {
        existingNote.title = title;
      }
      if (content) {
        existingNote.content = content;
      }
      fs.writeFile("notes.json", JSON.stringify(notes), (err) => {
        if (err) {
          console.error(err);
          reject("Error 500!");
          return;
        }
        deleteFlag = true;
        console.log(
          `Note with id ${noteId} deleted from notes.json successfully`
        );
        resolve(deleteFlag);
      });
    });
  });
}

export const getNotes = async (req, res) => {
  try {
    let selectedNotes = await getNotesFromFileForUsers(req.user.id);
    if (selectedNotes.length === 0) {
      res.status(404).json({
        message: `No notes found for user id ${req.user.id}`,
      });
    } else {
      res.status(200).json(selectedNotes);
    }
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve the notes from database. Error: ${error}`,
    });
  }
};

export const createNote = async (req, res) => {
  const note = req.body;

  if (!note) {
    return res.status(400).json({ message: "Note is missing or invalid" });
  }

  const noteObj = { ...note, id: uuidv4(), user_id: req.user.id };

  try {
    const currentNote = await addNotesToFile(noteObj);
    res
      .status(201)
      .json({ message: `Note with user_id ${req.user.id} added to Database!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Unable to add the note to database, error: ${error}`,
    });
  }
};

export const getNote = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await getNoteBasedOnId(id, req.user.id);
    if (!note) {
      res.status(404).json({ message: `Note with id ${id} not found!` });
    } else {
      res.status(200).send(note);
    }
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving note with id ${id}: ${error}`,
    });
  }
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteNoteBasedOnId(id, req.user.id);
    if (!result) {
      res.status(404).json({
        message: `Note with id ${id} not found.`,
      });
      return;
    }
    res
      .status(200)
      .send(`Note with the id ${id} deleted from the database successfully.`);
  } catch (error) {
    res.status(500).json({
      message: `Unable to delete note with id ${id}, error: ${error}`,
    });
  }
};

export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const result = await updateNoteWithId(id, req.user.id, title, content);
    if (!result) {
      return res.status(404).json({ message: `Note with id ${id} not found` });
    }
    res.status(200).send(`Note with id ${id} updated`);
  } catch (error) {
    res.status(500).json({
      message: `Unable to update note with id ${id}, error: ${error}`,
    });
  }
};
