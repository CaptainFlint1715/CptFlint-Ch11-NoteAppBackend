const express = require('express')
const fs = require('fs')
const uuid = require('uuid')
const util = require('util')
const path = require('path')
const PORT = process.env.PORT || 3000;

const app = express();

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile)

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  )

const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
}

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))

app.get('/assets/js/index.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'assets', 'js', 'index.js'));
  });
  
  // Route for serving CSS file
  app.get('/assets/css/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'assets', 'css', 'styles.css'));
  });

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
  });


// GET Route for homepage
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, 'notes.html'))
);

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);



// GET Route for retrieving all previously saved notes
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for saved notes`);

    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});


// POST Route for saving a new note
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to save note`);

    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
            title,
            text,
            noteID: uuid(),
        };

        readAndAppend(newNote, './db/db.json');

        const response = {
            status: 'success',
            body: newNote,
        };

        res.json(response);
    } else {
        res.json('Error in posting note');
    }
});