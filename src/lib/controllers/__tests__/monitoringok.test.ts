import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

describe("Test monitoring service", () => {
    let mongoServer:MongoMemoryServer;
    let mongoUri: string;

    beforeAll(async() =>{
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        jest.mock('../../config/config', () => ({
            ...jest.requireActual('../../config/config'),
            dbUrl: mongoUri
        }));
 
    })

    afterAll(async() =>  {
        await mongoose.disconnect()
        await mongoServer.stop()
    })
    it("Check selftest", async () => {
        const refreshModule = await import('../monitoring');
        const selftestResult = await refreshModule.selftest();
        //console.log("SelftestOK", selftestResult)
        expect(selftestResult.statusCode).toBe(200);
        expect(selftestResult.checks[0].result).toBe("connected");
        await mongoose.disconnect();
        await mongoServer.stop();
    });


})
