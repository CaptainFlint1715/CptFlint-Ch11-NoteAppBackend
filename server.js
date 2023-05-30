const express = require('express')
const fs = require('fs')
const uuid = require('uuid')
const util = require('util')
const path = require('path')
const PORT = process.env.PORT || 3001;

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

// GET Route for homepage


// GET Route for notes page
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/notes.html'))
);

app.get('/assets/js/index.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'js', 'index.js'));
  });
  
  // Route for serving CSS file
  app.get('/assets/css/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'css', 'styles.css'));
  });

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.ico'));
  });


// GET Route for retrieving all previously saved notes
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for saved notes`);
  
    readFromFile('./db/db.json', 'utf8')
      .then((data) => {
        console.log('File contents:', data); // Log the contents of the file
        res.json(JSON.parse(data));
      })
      .catch((error) => {
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read notes data.' });
      });
  });


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
  
      // Fetch the updated list of notes
      readFromFile('./db/db.json', 'utf8')
        .then((data) => {
          const notes = JSON.parse(data);
          const response = {
            status: 'success',
            body: newNote,
            notes: notes, // Include the updated notes in the response
          };
          res.json(response);
        })
        .catch((error) => {
          console.error('Error reading file:', error);
          res.status(500).json({ error: 'Failed to read notes data.' });
        });
    } else {
      res.status(400).json({ error: 'Missing required properties.' });
    }
  });

app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);