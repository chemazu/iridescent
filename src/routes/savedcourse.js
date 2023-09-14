import express from 'express'
import School from '../models/School'
import Course from '../models/Course'
import SavedCourse from '../models/SavedCourse'
import studentAuth from '../middleware/studentAuth'

const router = express.Router()

router.post('/:schoolname/:courseId', studentAuth, async (req, res) => {
    const schoolname = req.params.schoolname
    const studentId = req.student.id
    const idOfCourseToBeSaved = req.params.courseId

    try {
        const school = await School.findOne({
            name: schoolname
        })

        if(!school){
            return res.status(400).json({
                errors: [{msg: 'school not found'}]
            })
        }

        const course = await Course.findOne({
            _id: idOfCourseToBeSaved
        })

        if(!course){
            return res.status(400).json({
                errors: [{msg: 'course not found'}]
            })
        }

        const courseAlreadySaved = await SavedCourse.findOne({
            course: idOfCourseToBeSaved
        })

        if(courseAlreadySaved){
            return res.status(400).json({
                errors: [{msg:'course already saved'}]
            })
        }

        const newSavedCourse = new SavedCourse({
            savedby: studentId,
            savedfrom: school._id,
            course: idOfCourseToBeSaved
        })

        await newSavedCourse.save()

        res.json(newSavedCourse)

    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})

router.get('/:schoolname', studentAuth, async(req, res) => {
    const schoolname = req.params.schoolname
    const studentid = req.student.id

    try {
        const school = await School.findOne({
            name: schoolname
        })

        if(!school){
            return res.status(400).json({
                errors: [{msg: 'school not found'}]
            })
        }

        const savedCourses = await SavedCourse.find({
            savedby: studentid,
            savedfrom: school._id
        }).populate('course')

        res.json(savedCourses)

    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})

router.get('/:schoolname/:courseId', studentAuth, async (req, res) => {
    const schoolname = req.params.schoolname
    const studentId = req.student.id
    const courseId = req.params.courseId 

    try {
        const school = await School.findOne({
            name: schoolname
        })

        if(!school){
            return res.status(400).json({
                errors: [{msg: 'school not found'}]
            })
        }

        const course = await SavedCourse.findOne({
            _id: courseId,
            savedby: studentId
        }).populate('course')

        res.json(course)

    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})

export default router