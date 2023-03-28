const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../model/Notes");
const { body, validationResult } = require("express-validator");

// route 1 : fetch all the note of sepecific user
router.get("/fetchallnotes", fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some things occoured wrongs");
    }
});
// route 2: Add a new notes note of sepecific user
router.post(
    "/addnotes",
    fetchUser,
    [
        body("title").isLength({ min: 5 }),
        body("description").isLength({ min: 10 }),
    ],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return res.status(400).json({ error: error.array() });
            }
            const note = new Notes({
                title,
                description,
                tag,
                user: req.user.id,
            });
            const saveNote = await note.save();
            res.json(saveNote);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("some things occoured wrongs");
        }
    }
);
// route 3 : Update notes by user login is required end point api/notes/updatenote
router.put('/updatenote/:id', fetchUser, [
    body('title').isLength({ min: 5 }),
    body('description').isLength({ min: 5 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag }
        // find the note to be updated or update it 
        let note = await Notes.findById(req.params.id)
        if (!note) {
            return res.status(404).send("Note Found")
        }
        if (note.user.toString() !== req.user.id) {
            res.status(401).send("Unauthorized user")
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    } catch (error) {
        res.send(error)
    }
})

// router 4 : this route is create for delete a note form list useing delete type request 
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
    let note = await Notes.findById(req.params.id)
    if (!note) {
        return res.status(404).send("Not Found")
    }
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Access Denied")
    }
    note = await Notes.findByIdAndDelete(req.params.id)
    res.json({ "Sucess": "note is deleted paramanetly" })
})
module.exports = router;
