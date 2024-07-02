// const Project = require('../models/Project');

// exports.getAllProjects = async (req, res) => {
//     try {
//       const projects = await Project.find();
//       res.json(projects);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   };

// exports.getProjectById = async (req, res) => {
//   try {
//     const project = await Project.findOne({ name: req.params.projectId });
//     if (!project) return res.status(404).json({ message: 'Project not found' });
//     res.json(project);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.createProject = async (req, res) => {
//     try {
//       const { name, owner, work_done } = req.body;
//       // Extract filenames of uploaded images
//       const images = req.files.map(file => file.filename);
//       const project = new Project({ name, owner, work_done, images });
//       await project.save();
//       res.status(201).json(project);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   };
  

const Project = require('../models/Project');
const { cloudinary } = require('../cloudinary'); // Import Cloudinary configuration

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({ name: req.params.projectId });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, owner, work_done } = req.body;
        const images = req.files.map(file => file.buffer); // Get file buffer for Cloudinary upload

        // Upload images to Cloudinary and get URLs
        const uploadedImages = await Promise.all(
            images.map(image =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) reject(error);
                        resolve(result.secure_url); // Resolve with the secure URL of the uploaded image
                    }).end(image);
                })
            )
        );

        // Create a new project instance with all fields including Cloudinary image URLs
        const project = new Project({ name, owner, work_done, images: uploadedImages });

        // Save the project to the database
        await project.save();

        // Send the project data in the response
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ message: 'Error creating project' });
    }
};



// exports.createProject = async (req, res) => {
//     try {
//       const { name, owner, work_done, images } = req.body;
//       const project = new Project({ name, owner, work_done, images });
//       await project.save();
//       res.status(201).json(project);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   };