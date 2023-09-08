// __mocks__/mongoose.js

interface MongooseMock {
  connect: jest.Mock;
  // Add other properties if needed
}

const mongoose: MongooseMock = {
    connect: jest.fn(),
  };
  
export default mongoose;
  