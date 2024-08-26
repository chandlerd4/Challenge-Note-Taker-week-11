const express = require('express')
const path = require('path')
const fs =  require('fs')

const app = express()
const PORT = process.env.PORT || 3001
const notes =  require('./db/db.json')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'))
})

app.get('/api/notes', (req, res) => {
  res.json(notes)
})

app.post('/api/notes', (req, res) => {
    const readNotes = notes

    const newNote = {
        title: req.body.title,
        text: req.body.text
    }

    const updatedNotes = readNotes.push(newNote)

    fs.writeFile('./db/db.json', JSON.stringify(updatedNotes), (err, result)=> {
        if (err) throw err;
        console.log('note written');
    })
})



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => console.log('server is running'))