const {MongoClient} = require("mongodb");
const dns = require("dns").promises;

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "agit";

let client, db;

async function connectMongo() {
    if (!client) {
        await initializeDnsForTethering();
        await initializeDb();
    }
    return {client, db};
}

async function initializeDnsForTethering() {
    const result = dns.getServers();
    console.log(`current Dns Setting : ${result}`)
    if (!!result && !!result.length && result[0] === "127.0.0.1") {
        await dns.setServers(["8.8.8.8"])
        console.log(`updated dns setting : ${dns.getServers()}`);
    }
}

async function initializeDb() {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("[DB] connected");
}

module.exports = {connectMongo};
