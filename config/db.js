/*import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

export default connectDB*/
// utils/db.js
import mongoose from "mongoose";

const connections = {};
const baseUri = "mongodb+srv://denismoini09:axeY1ndhdWei6sPd@x5aside.m8cfakc.mongodb.net/";
console.log(process.env)
const connectDb = async (dbName) => {
  if (connections[dbName]) return connections[dbName];
  const fullUri = `${baseUri}${dbName}?retryWrites=true&w=majority`;
  console.log(fullUri);
  const conn = mongoose.createConnection(fullUri);
  console.log(`MongoDB connected: ${conn.host}`);

  connections[dbName] = conn;
  return conn;
};

const getModel = async (dbName, modelName, schema) => {
  const conn = await connectDb(dbName);
  if (!conn.models[modelName]) {
    conn.model(modelName, schema);
  }
  return conn.models[modelName];
};

export { connectDb, getModel }

