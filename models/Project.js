const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: String,
  owner: String,
  work_done: String,
  images: [String]
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
