const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ok, fail } = require('../utils/responses');

// Authentication & user registration routes
const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is up
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/health', (req,res)=> ok(res,'Welcome, the server is up and running'));

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "u1"
 *               password:
 *                 type: string
 *                 example: "pass"
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserPublic'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Username exists
 *       500:
 *         description: Server error
 */
router.post('/auth/register', async (req,res)=>{
  const { username, password, role='user' } = req.body || {};
  if (!username || !password) return fail(res,'Invalid username or password',{},400);
  try {
    const exists = await User.findOne({ username });
    if (exists) return fail(res,'Username already exists',{},409);
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, role });
    // Never return the password field to clients
    return ok(res, `User ${user.username} registered successfully`, { username:user.username, role:user.role }, 201);
  } catch (e) {
    return fail(res,'Error registering user',{details:e.message},500);
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login (sets cookie "token")
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "u1"
 *               password:
 *                 type: string
 *                 example: "pass"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "token=eyJ...; Path=/; HttpOnly"
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginData'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/auth/login', async (req,res)=>{
  const { username, password } = req.body || {};
  if (!username || !password) return fail(res,'Invalid username or password',{},400);
  try {
    const user = await User.findOne({ username });
    if (!user) return fail(res,'Invalid username or password',{},401);
    const match = await bcrypt.compare(password, user.password);
    if (!match) return fail(res,'Invalid username or password',{},401);

    const token = jwt.sign(
    { id: user._id.toString(), username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' });
    // NOTE: httpOnly=false for testing via Supertest cookie reads.
    // Set to true in production for better security.
    res.cookie('token', token, { httpOnly:false }); 
    return ok(res,'Login successful',{ token });
  } catch (e) {
    return fail(res,'Error during login',{details:e.message},500);
  }
});

module.exports = router;
