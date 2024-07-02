// backend/routes/projectsRoutes.js
const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');

// Define routes
router.get('/', projectsController.getAllProjects);
router.get('/:projectId', projectsController.getProjectById);
router.post('/', projectsController.createProject);

module.exports = router;
