## Nodejs
Creating authentication system for the users and building APIs that allows users to view, create, update, and delete notes. 
The project includes following files.

- `index.js`: This is the main server file which runs the server. To run the server, first run npm install to install all dependencies and then run npm start. The server will start listening on port 3000 by default.

- `routes/notes.js`: This is a route file which contains all the APIs related to the "/notes" route. The APIs allow you to create, read, update, and delete notes.

- `controllers/notes.js`: This file contains all the necessary functions used by the APIs in notes.js. The functions include creating a new note, retrieving a note by ID, updating a note, and deleting a note.

- `notes.json`: This is a local JSON file for storing all the information of notes. The notes object has a schema of id, title, content, and user_id.

- `users.json`: This is a local JSON file for storing all the information of users. It includes user details such as email, password, and name.

- `tests/notes.test.js`: This is a test files which uses jest framework to test the apis.

JWT (JSON Web Token) authentication is a widely used technique for securing API endpoints. It works by creating a token that contains information about the user, such as their user ID and email address, and signing it with a secret key known only to the server.

In this Node.js project, JWT is used to authenticate users during the signup and signin processes. When a user signs up or signs in, a token is generated for them and stored in a cookie on the client side. The cookie is sent with subsequent requests to the server, and the server can use the token to verify the identity of the user and grant access to protected endpoints.

The project uses the jsonwebtoken library to generate and sign the tokens. The library allows us to specify a secret key that is used to sign the token, and to include custom data in the token payload. In this project, the token payload includes the user's ID, name, email, and password hash.

When a user signs up or signs in, a token is generated and returned in the response body. The client-side code can then store the token in a cookie or local storage, and include it in subsequent requests to the server. The server-side code can verify the token by decoding it using the same secret key used to sign it, and then using the user's ID to look up the user in the database.

In summary, JWT authentication is a secure and widely used technique for authenticating API users. It works by creating a token that contains information about the user, and signing it with a secret key. The server can then verify the token and use the information it contains to authenticate the user and grant access to protected endpoints.


## How to run

### To run server
To get started with this project, you'll need to have Node.js installed on your machine. Once you've cloned the repository, run npm install to install all dependencies.

Next, run `npm run start` to start the server. The server will be accessible at `http://localhost:3000`. 

You can use postman to make post or get calls to test the apis and their workings. If you make api calls without signing in you will get unauthorised error. So you will need to signin before making any calls.

### To run tests
run `npm run test` to start the testing in jest. It will look through all the `.test.js` files in the project for tests. 

## API Documentation
The following APIs are available in this project:

### Authentication
- `POST /signup`: Creates a new user account. The request body should include the user's email, password, and name.

- `POST /signin`: Signs in an existing user. The request body should include the user's email and password.

- `POST /signout`: Signs out the currently signed in user.

### Notes
- `GET /notes`: Retrieves all notes for the currently signed in user.

- `POST /notes`: Creates a new note for the currently signed in user. The request body should include the note's title and content. It assign a unique id to the note and userid of the current user.

- `GET /notes/:id`: Retrieves a specific note by ID for the currently signed in user.

- `PUT /notes/:id`: Updates a specific note by ID for the currently signed in user. The request body should include the updated note's title and content.

- `DELETE /notes/:id`: Deletes a specific note by ID for the currently signed in user.

- `PATCH /notes/:id`: Updates a specific note by ID for the currently signed in user. The request body should include the updated note's title and content.


### Json schemas used for notes and user
The following JSON schemas are used in this project:

### Notes
```
{
  "id": "string",
  "title": "string",
  "content": "string",
  "user_id": "string"
}
```

### Users
```
{
  "email": "string",
  "password": "string", 
  "name": "string"
}
```
note the password will be hashed before saving. Hence it is completely secure.
