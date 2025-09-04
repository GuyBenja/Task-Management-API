const mongoose = require('mongoose');

// Minimal user model for auth + RBAC
// - password is already hashed when stored
const userSchema = new mongoose.Schema({
  username: { type:String, unique:true, required:true, trim:true },
  password: { type:String, required:true },
  role:     { type:String, enum:['user','admin'], default:'user' }
}, { timestamps:true });

module.exports = mongoose.model('User', userSchema);