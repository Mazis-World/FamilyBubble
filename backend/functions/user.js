// backend/functions/user.js

const USERS = {
  collection: "users",
  fields: {
    userId: "ID", // Document Key
    fullName: "string",
    photoURL: "string",
    createdAt: "timestamp",
    premium: "boolean",
    bubbles: "array<string>", // List of all bubbleIds this user is a member of.
  },
  notes: {
    userId: "Document Key",
    bubbles: "Essential for membership check.",
    premium: "RevenueCat subscription status. Global setting.",
  },
};

module.exports = USERS;
