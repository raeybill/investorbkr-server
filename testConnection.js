const { MongoClient } = require('mongodb');

// Replace the following with your connection string
const uri = 'mongodb+srv://raymondowen75:6GNlZ4NydYziMiSC@investorbkr0.izgb4.mongodb.net/?retryWrites=true&w=majority&appName=investorbkr0';

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('Connected to MongoDB successfully!');

    // Optional: Check if the database and collection exist
    const database = client.db("IBKR");
    const collection = database.collection("USERS");
    const docCount = await collection.countDocuments();
    console.log(`Collection has ${docCount} documents.`);

  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await client.close();
  }
}

testConnection();
