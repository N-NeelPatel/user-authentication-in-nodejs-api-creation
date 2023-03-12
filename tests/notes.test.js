// import request from "supertest";
const { fs } = require("fs");
const request = require("supertest");
const getNote = require("../controllers/notes.js");

jest.mock("fs");

describe("getNotes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return an array of notes if notes are found for the user", async () => {
    // mock the data returned from the file system
    const mockData = {
      notes: [
        {
          id: "1",
          user_id: "123",
          title: "Note 1",
          content: "Lorem ipsum dolor sit amet",
        },
        {
          id: "2",
          user_id: "123",
          title: "Note 2",
          content: "Consectetur adipiscing elit",
        },
      ],
    };
    fs.readFile.mockImplementation((file, callback) => {
      callback(null, JSON.stringify(mockData));
    });

    // make the request to the API
    const response = await request(getNote)
      .get("/notes")
      .set("Authorization", "Bearer fakeToken")
      .expect(200);

    // check that the response matches the expected data
    expect(response.body).toEqual(mockData.notes);
  });

  it("should return a 404 error if no notes are found for the user", async () => {
    // mock the data returned from the file system
    const mockData = {
      notes: [
        {
          id: "1",
          user_id: "456",
          title: "Note 1",
          content: "Lorem ipsum dolor sit amet",
        },
        {
          id: "2",
          user_id: "456",
          title: "Note 2",
          content: "Consectetur adipiscing elit",
        },
      ],
    };
    fs.readFile.mockImplementation((file, callback) => {
      callback(null, JSON.stringify(mockData));
    });

    // make the request to the API
    const response = await request(getNote)
      .get("/notes")
      .set("Authorization", "Bearer fakeToken")
      .expect(404);

    // check that the response matches the expected data
    expect(response.body).toEqual({
      message: "No notes found for user id 123",
    });
  });

  it("should return a 500 error if there is an error reading the file", async () => {
    // mock an error being returned from the file system
    fs.readFile.mockImplementation((file, callback) => {
      callback(new Error("Error reading file"));
    });

    // make the request to the API
    const response = await request(getNote)
      .get("/notes")
      .set("Authorization", "Bearer fakeToken")
      .expect(500);

    // check that the response matches the expected data
    expect(response.body).toEqual({
      message:
        "Unable to retrieve the notes from database. Error: Error reading file",
    });
  });

  it("should return a 500 error if there is an error parsing the file data", async () => {
    // mock an error being returned when parsing the file data
    fs.readFile.mockImplementation((file, callback) => {
      callback(null, "invalid json");
    });

    // make the request to the API
    const response = await request(getNote)
      .get("/notes")
      .set("Authorization", "Bearer fakeToken")
      .expect(500);

    // check that the response matches the expected data
    expect(response.body).toEqual({
      message:
        "Unable to retrieve the notes from database. Error: Unexpected token i in JSON at position 0",
    });
  });
});

// These tests cover three scenarios:

// The API should return a 200 status code and an array of notes when a valid user id is provided.
// The API should return a 404 status code and an appropriate message when no notes are found for the user id.
// The API should return a 500 status code and an error message when an error occurs during the process of retrieving notes from the database.

describe("getNotes function", () => {
  it("should return 200 status code and an array of notes when valid user id is provided", async () => {
    const req = {
      user: { id: "123" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockSelectedNotes = [
      {
        id: "note1",
        user_id: "123",
        title: "Test Note 1",
        content: "This is a test note.",
      },
    ];
    jest
      .spyOn(api, "getNotesFromFileForUsers")
      .mockResolvedValue(mockSelectedNotes);

    await api.getNotes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSelectedNotes);
  });

  it("should return 404 status code when no notes found for user id", async () => {
    const req = {
      user: { id: "456" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockSelectedNotes = [];
    jest
      .spyOn(api, "getNotesFromFileForUsers")
      .mockResolvedValue(mockSelectedNotes);

    await api.getNotes(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "No notes found for user id 456",
    });
  });

  it("should return 500 status code and an error message when an error occurs", async () => {
    const req = {
      user: { id: "789" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const errorMessage = "Internal server error";
    jest.spyOn(api, "getNotesFromFileForUsers").mockRejectedValue(errorMessage);

    await api.getNotes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: `Unable to retrieve the notes from database. Error: ${errorMessage}`,
    });
  });
});

// The first test scenario checks if the endpoint returns a 404 error when there are no notes found for the user. The second test scenario checks if the endpoint returns a 500 error when an error occurs while retrieving the notes.

describe("getNotes endpoint", () => {
  test("returns 404 if no notes found for user", async () => {
    // Mock getNotesFromFileForUsers to return an empty array
    getNotesFromFileForUsers.mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/notes")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No notes found for user id userId");
  });

  test("returns 500 if error occurs while retrieving notes", async () => {
    // Mock getNotesFromFileForUsers to throw an error
    getNotesFromFileForUsers.mockRejectedValueOnce("Error");

    const res = await request(app)
      .get("/notes")
      .set("Authorization", "Bearer token");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe(
      "Unable to retrieve the notes from database. Error: Error"
    );
  });
});

// These tests cover the following scenarios:

// Creating a note with missing or invalid note data returns a 400 error
// Creating a note with valid note data returns a 201 success status code and success message
// Creating a note with valid note data but encountering an error while adding to database returns a 500 error with error message.

describe("createNote API", () => {
  it("should return 400 status code and error message when note is missing or invalid", async () => {
    const res = await request(app).post("/notes").send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "Note is missing or invalid" });
  });

  it("should return 201 status code and success message when note is created", async () => {
    const mockNote = { title: "test note", content: "this is a test note" };
    addNotesToFile.mockResolvedValueOnce(mockNote);

    const res = await request(app)
      .post("/notes")
      .send(mockNote)
      .set("Authorization", "Bearer test_token");

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      message: "Note with user_id test_user_id added to Database!",
    });
  });

  it("should return 500 status code and error message when note creation fails", async () => {
    const mockNote = { title: "test note", content: "this is a test note" };
    const mockError = new Error("Failed to add note to file");
    addNotesToFile.mockRejectedValueOnce(mockError);

    const res = await request(app)
      .post("/notes")
      .send(mockNote)
      .set("Authorization", "Bearer test_token");

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      message: `Unable to add the note to database, error: ${mockError}`,
    });
  });
});

// These tests check that the getNote API returns the correct status code and response body for different scenarios:

// A valid note ID is provided and the note is successfully retrieved from the database.
// An invalid note ID is provided and a 404 error is returned.
// There is a server error when retrieving the note and a 500 error is returned.

describe("GET /notes/:id", () => {
  const mockNote = {
    id: "123",
    title: "Mock Note",
    content: "This is a mock note",
    user_id: "456",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a note with a valid id", async () => {
    // Mock the getNoteBasedOnId function
    getNoteBasedOnId.mockResolvedValue(mockNote);

    const response = await request(app)
      .get(`/notes/${mockNote.id}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockNote);
    expect(getNoteBasedOnId).toHaveBeenCalledWith(
      mockNote.id,
      validTokenPayload.id
    );
  });

  it("should return a 404 error with an invalid id", async () => {
    // Mock the getNoteBasedOnId function
    getNoteBasedOnId.mockResolvedValue(null);

    const response = await request(app)
      .get(`/notes/${mockNote.id}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: `Note with id ${mockNote.id} not found!`,
    });
    expect(getNoteBasedOnId).toHaveBeenCalledWith(
      mockNote.id,
      validTokenPayload.id
    );
  });

  it("should return a 500 error with a server error", async () => {
    // Mock the getNoteBasedOnId function to throw an error
    getNoteBasedOnId.mockImplementation(() => {
      throw new Error("Server error");
    });

    const response = await request(app)
      .get(`/notes/${mockNote.id}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      message: `Error retrieving note with id ${mockNote.id}: Error: Server error`,
    });
    expect(getNoteBasedOnId).toHaveBeenCalledWith(
      mockNote.id,
      validTokenPayload.id
    );
  });
});

// Import necessary modules and functions

describe("deleteNote API", () => {
  let req;
  let res;

  beforeEach(() => {
    // Create mock request and response objects
    req = {
      params: {
        id: "abc123",
      },
      user: {
        id: "user123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a note and return a success message with status 200", async () => {
    // Mock the deleteNoteBasedOnId function to return a truthy value
    deleteNoteBasedOnId = jest.fn().mockReturnValue(true);

    // Call the deleteNote API
    await deleteNote(req, res);

    // Check that the deleteNoteBasedOnId function was called with the correct arguments
    expect(deleteNoteBasedOnId).toHaveBeenCalledWith("abc123", "user123");

    // Check that the response status and message are correct
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      "Note with the id abc123 deleted from the database successfully."
    );
  });

  it("should return an error message with status 404 if the note is not found", async () => {
    // Mock the deleteNoteBasedOnId function to return a falsy value
    deleteNoteBasedOnId = jest.fn().mockReturnValue(false);

    // Call the deleteNote API
    await deleteNote(req, res);

    // Check that the deleteNoteBasedOnId function was called with the correct arguments
    expect(deleteNoteBasedOnId).toHaveBeenCalledWith("abc123", "user123");

    // Check that the response status and message are correct
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Note with id abc123 not found.",
    });
  });

  it("should return an error message with status 500 if there is a server error", async () => {
    // Mock the deleteNoteBasedOnId function to throw an error
    deleteNoteBasedOnId = jest.fn().mockImplementation(() => {
      throw new Error("Database error");
    });

    // Call the deleteNote API
    await deleteNote(req, res);

    // Check that the deleteNoteBasedOnId function was called with the correct arguments
    expect(deleteNoteBasedOnId).toHaveBeenCalledWith("abc123", "user123");

    // Check that the response status and message are correct
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Unable to delete note with id abc123, error: Error: Database error",
    });
  });
});

const { updateNote } = require("./your/api/module");
const { updateNoteWithId } = require("./your/api/data");

jest.mock("./your/api/data");

describe("updateNote", () => {
  const req = {
    params: { id: "note_id" },
    body: { title: "new_title", content: "new_content" },
    user: { id: "user_id" },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
  };
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the note with the given ID and return success message", async () => {
    updateNoteWithId.mockResolvedValueOnce(true);
    await updateNote(req, res, next);
    expect(updateNoteWithId).toHaveBeenCalledWith(
      "note_id",
      "user_id",
      "new_title",
      "new_content"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Note with id note_id updated");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 404 if note with the given ID is not found", async () => {
    updateNoteWithId.mockResolvedValueOnce(false);
    await updateNote(req, res, next);
    expect(updateNoteWithId).toHaveBeenCalledWith(
      "note_id",
      "user_id",
      "new_title",
      "new_content"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Note with id note_id not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if an error occurs", async () => {
    const errorMessage = "Something went wrong";
    updateNoteWithId.mockRejectedValueOnce(new Error(errorMessage));
    await updateNote(req, res, next);
    expect(updateNoteWithId).toHaveBeenCalledWith(
      "note_id",
      "user_id",
      "new_title",
      "new_content"
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: `Unable to update note with id note_id, error: ${errorMessage}`,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
