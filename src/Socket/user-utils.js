// === What This File Does ===
// This file has helper functions to convert between user IDs (like emails or enrollment IDs)
// and database IDs. It helps the chat system find the right user in the database.

// === Tools We Need ===
const { Employee, Student_Enrollment } = require("./db-config");

// === Turn a User ID into a Database ID ===
// This function takes a user ID (like an email for instructors or a number for students)
// and finds their matching ID in the database.
// Example: For a student with ID "123", it returns 123.
// Example: For an instructor with email "teacher@example.com", it returns their database ID, like 5.
async function mapUserIdToId(userId, userType) {
  try {
    if (userType === "instructor") {
      // Look up the instructor by their email
      const employee = await Employee.findOne({
        where: { email: userId },
        attributes: ["id"],
      });
      if (!employee) {
        console.error(`No instructor found with email: ${userId}`);
        throw new Error(`No instructor found with email: ${userId}`);
      }
      console.log(`Found instructor ${userId} with database ID ${employee.id}`);
      return employee.id; // Return the instructor's database ID
    } else if (userType === "student") {
      // Look up the student by their enrollment ID
      const enrollment = await Student_Enrollment.findOne({
        where: { id: userId },
        attributes: ["id"],
      });
      if (!enrollment) {
        console.error(`No student found with ID: ${userId}`);
        throw new Error(`No student found with ID: ${userId}`);
      }
      console.log(`Found student ${userId} with enrollment ID ${userId}`);
      return parseInt(userId); // Convert the ID to a number
    } else {
      // If we don't know the user type, try student ID first, then instructor email
      const parsedId = parseInt(userId);
      if (!isNaN(parsedId)) {
        // Check if it's a valid student ID
        const enrollment = await Student_Enrollment.findOne({
          where: { id: parsedId },
          attributes: ["id"],
        });
        if (enrollment) {
          console.log(`Found student with ID ${parsedId}`);
          return parsedId;
        }
      }
      // If not a student ID, check if it's an instructor email
      const employee = await Employee.findOne({
        where: { email: userId },
        attributes: ["id"],
      });
      if (!employee) {
        console.error(`No user found with ID or email: ${userId}`);
        throw new Error(`No user found with ID or email: ${userId}`);
      }
      console.log(`Found instructor ${userId} with database ID ${employee.id}`);
      return employee.id;
    }
  } catch (err) {
    console.error(`Error finding user ${userId} (${userType}): ${err.message}`);
    throw err;
  }
}

// === Turn a Database ID Back into a User ID ===
// This function takes a database ID and turns it back into a user ID
// (email for instructors, enrollment ID for students).
// Example: For database ID 5 (instructor), it returns "teacher@example.com".
// Example: For database ID 123 (student), it returns "123".
async function mapIdToUserId(id, type) {
  try {
    if (type === "student") {
      // Check if the student ID exists
      const enrollment = await Student_Enrollment.findOne({
        where: { id },
        attributes: ["id"],
      });
      if (!enrollment) {
        console.error(`No student found with ID: ${id}`);
        throw new Error(`No student found with ID: ${id}`);
      }
      console.log(`Found student with ID ${id}`);
      return String(id); // Turn the number into text
    }
    if (type === "instructor") {
      // Check if the instructor ID exists
      const employee = await Employee.findOne({
        where: { id },
        attributes: ["email"],
      });
      if (!employee) {
        console.error(`No instructor found with ID: ${id}`);
        throw new Error(`No instructor found with ID: ${id}`);
      }
      console.log(`Found instructor with ID ${id}, email ${employee.email}`);
      return employee.email; // Return the instructor's email
    }
    console.error(`Invalid user type: ${type}`);
    throw new Error(`Invalid user type: ${type}`);
  } catch (err) {
    console.error(`Error mapping ID ${id} (${type}): ${err.message}`);
    return `user${id}`; // Fallback if something goes wrong
  }
}

// === Share These Functions ===
module.exports = {
  mapUserIdToId,
  mapIdToUserId,
};
