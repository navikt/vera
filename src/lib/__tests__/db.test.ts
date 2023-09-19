import connectDB from '../db';
//import config from '../../lib/config/config';
import mongoose from 'mongoose';

describe('connectDB', () => {
  it('should connect to the database', async () => {
    // Mock configuration
    const config = {
      dbUrl: 'mongodb://localhost:27017/testdb',
      dbUser: 'username',
      dbPassword: 'password'
    };

    // Mock the global object
    global.mongoose = { conn: null, promise: null };

    // Set the config
    jest.mock('../../lib/config/config', () => ({ default: config }));

    // Call the function
    await connectDB();

    // Assertions (add your own)
    expect(mongoose.connect).toHaveBeenCalledWith(config.dbUrl, expect.any(Object));
  });
});
