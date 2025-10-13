// === What This File Does ===
// This file brings in the tools we need to talk to the database and Redis.
// It lists all the database tables and tools used by the chat system.

// === Tools We Need ===
const {
  chatMessage, // Stores chat messages
  Student, // Holds student info (like name and ID)
  Employee, // Holds instructor info (like email and name)
  Student_Enrollment, // Tracks which courses students are in
  emp_subj, // Links instructors to the subjects they teach
  sequelize, // Helps us talk to the database
} = require("../models");
const redisClient = require("../config/redis.config"); // Tracks who's online
const { Op } = require("sequelize"); // Helps with database searches

// === Share These Tools ===
module.exports = {
  chatMessage,
  Student,
  Employee,
  Student_Enrollment,
  emp_subj,
  sequelize,
  redisClient,
  Op,
};
