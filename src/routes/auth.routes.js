const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ok, fail } = require('../utils/responses');

const router = express.Router();

router.get('/health', (req,res)=> ok(res,'Welcome, the server is up and running'));

router.post('/auth/register', async (req,res)=>{
  const { username, password, role='user' } = req.body || {};
  if (!username || !password) return fail(res,'Invalid username or password',{},400);
  try {
    const exists = await User.findOne({ username });
    if (exists) return fail(res,'Username already exists',{},409);
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, role });
    return ok(res, `User ${user.username} registered successfully`, { username:user.username, role:user.role }, 201);
  } catch (e) {
    return fail(res,'Error registering user',{details:e.message},500);
  }
});

router.post('/auth/login', async (req,res)=>{
  const { username, password } = req.body || {};
  if (!username || !password) return fail(res,'Invalid username or password',{},400);
  try {
    const user = await User.findOne({ username });
    if (!user) return fail(res,'Invalid username or password',{},401);
    const match = await bcrypt.compare(password, user.password);
    if (!match) return fail(res,'Invalid username or password',{},401);

    const token = jwt.sign({ username:user.username, role:user.role }, process.env.JWT_SECRET, { expiresIn:'1h' });
    res.cookie('token', token, { httpOnly:false }); // אם תרצה אבטחה גבוהה: true + sameSite/secure
    return ok(res,'Login successful',{ token });
  } catch (e) {
    return fail(res,'Error during login',{details:e.message},500);
  }
});

module.exports = router;