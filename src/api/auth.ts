import express from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

import { UserRepository } from "../models/userModel";
import { AUTH_SECRET_KEY } from "../constant";
import logger from "../logger";
import verifyToken from "../middlewares/authentication";

const tokenExpiresIn = parseInt(process.env.TOKEN_EXPIRES_IN || "600");
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "1d";

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Allows a new user to register by providing a username and password.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for the new user.
 *                 example: user123
 *               password:
 *                 type: string
 *                 description: The password for the new user.
 *                 example: password123
 *               role:
 *                 type: string
 *                 description: The role for the new user.
 *                 example: employee
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       '500':
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Registration failed
 */

router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    await UserRepository.create(username, password, role);
    res.success({ message: "User registered successfully" });
  } catch (error) {
    logger.error("Registration failed:" + JSON.stringify(error));
    res.error("Registration failed", 500, error.message);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user with username and password, returning access and refresh tokens.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: user123
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: password123
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Access token for the user.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token for the user.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       '401':
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication failed
 *       '500':
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Login failed
 */

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserRepository.findByName(username);
    if (!user) {
      return res.error("Authentication failed", 401);
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.error("Authentication failed", 401);
    }

    const token = jwt.sign({ userId: user._id }, AUTH_SECRET_KEY, {
      expiresIn: tokenExpiresIn
    });
    const refreshToken = jwt.sign({ userId: user._id }, AUTH_SECRET_KEY, {
      expiresIn: refreshTokenExpiresIn
    });
    res.success({
      token,
      refreshToken,
      user: { username: user.username, role: user.role, id: user.id }
    });
  } catch (error) {
    logger.error("Login failed: " + JSON.stringify(error));
    res.error("Login failed", 401, error.message);
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Validates a refresh token and returns a new access token.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token provided by the user.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       '200':
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New access token.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       '401':
 *         description: Access denied or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid refresh token."
 *       '400':
 *         description: Invalid refresh token format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid refresh token."
 */

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.error("Access Denied. No refresh token provided.", 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, AUTH_SECRET_KEY) as JwtPayload;
    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      return res.error("Invalid refresh token.", 400);
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, AUTH_SECRET_KEY, {
      expiresIn: tokenExpiresIn
    });

    res.success({ token: accessToken });
  } catch (error) {
    logger.error("Invalid refresh token: " + JSON.stringify(error));
    return res.error("Invalid refresh token.", 400);
  }
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the profile information of the authenticated user.
 *     security:
 *       - bearerAuth: []  # Assuming you are using bearer token for authentication
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successful retrieval of user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 role:
 *                   type: string
 *                   example: user
 *                 id:
 *                   type: string
 *                   example: 123456
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User requested was not found
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Get profile failed
 *                 message:
 *                   type: string
 *                   example: Invalid token
 */

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const { id } = req.user || {};
    const user = await UserRepository.findById(id);
    if (!user) {
      return res.error("User requested was not found", 404);
    }
    res.success({ username: user.username, role: user.role, id: user.id });
  } catch (error) {
    logger.error("Get profile failed: " + JSON.stringify(error));
    res.error("Get profile failed", 401, error.message);
  }
});

export default router;
