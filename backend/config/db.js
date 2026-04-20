const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// This will create a 'data' folder inside your 'backend' folder
const dataDir = path.join(__dirname, '../data');
const usersFile = path.join(dataDir, 'users.json');
const transactionsFile = path.join(dataDir, 'transactions.json');

const connectDB = async () => {
  try {
    if (!fsSync.existsSync(dataDir)) {
      fsSync.mkdirSync(dataDir, { recursive: true });
    }
    if (!fsSync.existsSync(usersFile)) {
      await fs.writeFile(usersFile, JSON.stringify([]));
    }
    if (!fsSync.existsSync(transactionsFile)) {
      await fs.writeFile(transactionsFile, JSON.stringify([]));
    }
    console.log(`✅ Local JSON Database Initialized in ${dataDir}`);
  } catch (error) {
    console.error(`❌ Local DB Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

// Helper functions we will use in the controllers
const readData = async (filePath) => {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

const writeData = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

module.exports = { connectDB, usersFile, transactionsFile, readData, writeData };