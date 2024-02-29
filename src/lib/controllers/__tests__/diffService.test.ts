import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose, { Mongoose } from "mongoose"
import { registerEvent } from "../versionApi"
import { diffEnvironments } from "../diffService"

describe("Test diffService", () => {
    let mongoServer: MongoMemoryServer
    const cached: { conn: null | Mongoose; promise: null | Promise<Mongoose> } = {
        conn: null,
        promise: null,
    }

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()

        const mongoUri = mongoServer.getUri()
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 3000,
        }
        cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
            return mongoose
        })
        cached.conn = await cached.promise

        const db = {
            connectDB: jest.fn().mockResolvedValue(cached.conn),
        }
        await db.connectDB()
    })

    afterAll(async () => {
        await cached.conn?.connection.close()
        await mongoose.connection.close()
        await mongoServer.stop()
    })

    it("Test Diff envs", async () => {
        const testApp = {
            application: "testApp",
            version: "1.0.0",
            environment: "qass",
            environmentClass: "preprod",
            deployer: "Fake Fake",
        }
        const testApp2 = {
            application: "testApp2",
            version: "1.0.1",
            environment: "prod",
            environmentClass: "prod",
            deployer: "Fake Fake",
        }
        const testApp3 = {
            application: "testApp3",
            version: "1.0.1",
            environment: "test",
            environmentClass: "test",
            deployedBy: "Fake Fake",
        }
        await registerEvent(testApp)
        await registerEvent(testApp2)
        await registerEvent(testApp3)

        const events = await diffEnvironments("prod", "qass")
        expect(events.length).toBe(2)
        events.forEach((event) => {
            expect(["prod", "qass"]).toContain(event.environment)
        })
    })
})
