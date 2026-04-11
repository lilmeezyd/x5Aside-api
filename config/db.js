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
const connectDb = async (dbName) => {
  if (connections[dbName]) return connections[dbName];
  const fullUri = `${process.env.MONGO_URI}${dbName}?retryWrites=true&w=majority`;
  const conn = await mongoose.createConnection(fullUri).asPromise();
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

