import express from 'express'
import { body, validationResult } from 'express-validator'
import Note from '../models/Note'
import CourseUnit from "../models/CourseUnit"
import studentAuth from '../middleware/studentAuth'

const router = express.Router()

router.post('/:courseUnitId', studentAuth, [
    body('text', 'note text cannot be empty').not().isEmpty(),
    body('timestamp', 'note timestamp cannot be empty').not().isEmpty()
], async (req, res) => {
    const courseUnitId = req.params.courseUnitId
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try {
    const courseUnit = await CourseUnit.findOne({
        _id: courseUnitId
    })

    if(!courseUnit){
        return res.json({
            errors: [{msg: "course unit not found"}]
        })
    }

    const noteObj = {
        text: req.body.text,
        timestamp: req.body.timestamp,
        createdby: req.student.id,
        courseunit: courseUnit._id
    }

    const newNote = new Note(noteObj)
    await newNote.save()
    res.json(newNote)
    } catch (error) {
        res.status(500).send("server error")
    }
})

// course unit ID
router.get('/:courseUnitId', studentAuth, async (req, res) => {
    try {
        const courseUnitId = req.params.courseUnitId
        const notes = await Note.find({
            courseunit: courseUnitId,
            createdby: req.student.id
        })
        res.json(notes)
    } catch (error) {
        res.status(500).send("server error")
    }
})

router.delete('/:courseUnitId/:noteId', studentAuth, async (req, res) => {
    const courseUnitId = req.params.courseUnitId
    const noteId = req.params.noteId

    try {
        const note = await Note.findOne({
            _id: noteId,
            courseunit: courseUnitId
        })
        note.remove()
        res.json(note)
    } catch (error) {
       res.status(500).send("server error")
    }
})

export default router