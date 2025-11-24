const { connectMongo } = require("../db/mongo");

async function getAllUsers() {
    const { db } = await connectMongo();
    return db.collection("users").find({}).toArray();
}

async function updateUserLolInfo(userId, fields) {
    const { db } = await connectMongo();
    return db.collection("users").updateOne(
        { _id: userId },
        { $set: { ...fields, updatedAt: new Date() } }
    );
}

module.exports = { getAllUsers, updateUserLolInfo };
