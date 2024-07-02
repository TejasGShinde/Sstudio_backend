// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const multer = require('multer'); // Import multer
// const projectsRoutes = require('./routes/projectsRoutes');
// const Project = require('./models/Project'); 
// const fs = require('fs'); // Import the 'fs' module for file system operations
// const app = express();

// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect('mongodb+srv://ptejas387:YN1mooGHVfSJjTwd@cluster0.c1gi7c3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// const db = mongoose.connection;
// db.on('error', (err) => {
//   console.error('Error connecting to MongoDB:', err);
// });
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// // Set up multer for handling image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       const dir = 'uploads/';
//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true }); // Create the destination directory if it does not exist
//       }
//       cb(null, dir); // Specify the directory where uploaded files will be stored
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname); // Set the filename to be unique
//     }
//   });
  
  
//   const upload = multer({ storage });
  
//   // Use multer middleware for handling image uploads
//  // Use multer middleware for handling image uploads
//  app.post('/projects', upload.array('images', 5), async (req, res) => {
//     try {
//       console.log('Request body:', req.body);
//       console.log('Uploaded images:', req.files);
      
//       const { name, owner, work_done } = req.body;
//       const images = req.files.map(file => file.filename);
  
//       // Create a new project instance with all fields
//       const project = new Project({ name, owner, work_done, images });
  
//       // Save the project to the database
//       await project.save();
  
//       // Send the project data in the response
//       res.status(201).json(project);
//     } catch (error) {
//       console.error('Error creating project:', error);
//       res.status(400).json({ message: 'Error creating project' });
//     }
//   });
  

// // Use routes
// app.use('/projects', projectsRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Import multer
const { cloudinary } = require('./cloudinary'); // Import Cloudinary configuration
const projectsRoutes = require('./routes/projectsRoutes');
const Project = require('./models/Project');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Set up multer for handling image uploads
const storage = multer.memoryStorage(); // Use memory storage for Cloudinary
const upload = multer({ storage });

// Use Cloudinary middleware for handling image uploads
app.post('/projects', upload.array('images', 25), async (req, res) => {
  try {
    const { name, owner, work_done } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const images = req.files.map(file => file.buffer); // Get file buffer for Cloudinary upload
    const uploadedImages = await Promise.all(
      images.map(image =>
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) {
              console.error('Error uploading image to Cloudinary:', error);
              reject(error);
            } else {
              resolve(result.secure_url); // Return the secure URL of the uploaded image
            }
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
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Use routes
app.use('/projects', projectsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
