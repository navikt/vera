import { deployLog, getConfig, registerEvent, returnCSVPayload } from "../versionApi";
import Event from "../../models/Event";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Mongoose } from 'mongoose';
import { IEvent, IEventEnriched } from "@/interfaces/IEvent";
import { IQueryParameter } from "@/interfaces/querys";


describe ("Test versionApi",  () => {
    let mongoServer: MongoMemoryServer;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const cached: { conn: null | Mongoose; promise: null | Promise<Mongoose> } = {
            conn: null,
            promise: null,
          };
        
        const mongoUri: string = mongoServer.getUri();
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 3000
        }

        cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
            return mongoose
        })
        cached.conn = await cached.promise 

        const db = {
            connectDB: jest.fn().mockResolvedValue(cached.conn)
        }
        await db.connectDB()

    })
    
    afterAll(async() => {
        await mongoose.connection.close();
        await mongoServer.stop();
    })
    
    beforeEach(async () => {
        await Event.deleteMany({});
    });

    it("Register new Event", async () => {
        const newEvent = {"application": "testApp", "version": "1.0.0", "environment": "test","environmentClass": "test", "deployer": "Fake Fake"};
        const savedEvent = await registerEvent(newEvent)
        expect(savedEvent).toHaveProperty('_id')
        expect(savedEvent).toHaveProperty('replaced_timestamp')


        const existingEvents = await Event.find({
            environment: new RegExp("^" + newEvent.environment + "$", "i"),
            application: new RegExp("^" + newEvent.application + "$", "i"),
            replaced_timestamp: null,
        });

        existingEvents.forEach((existingEvent) => {
            expect(existingEvent.replaced_timestamp).toBeDefined();
          });
    })

    it("Update version for Event", async () => {
        const newEvent = {"application": "testApp", "version": "1.0.0", "environment": "test","environmentClass": "test", "deployer": "Fake Fake"};
        const updatedEvent = {"application": "testApp", "version": "1.0.1", "environment": "test","environmentClass": "test", "deployer": "Fake Fake"};
        const savedEvent = await registerEvent(newEvent)
        expect(savedEvent).toHaveProperty('_id')
        expect(savedEvent).toHaveProperty('replaced_timestamp')
        
        const savedEventUpdate = await registerEvent(updatedEvent)
        expect(savedEventUpdate).toHaveProperty('_id')
        expect(savedEventUpdate).toHaveProperty('replaced_timestamp')
        const existingEvents = await Event.find({
            environment: new RegExp("^" + updatedEvent.environment + "$", "i"),
            application: new RegExp("^" + updatedEvent.application + "$", "i"),
            replaced_timestamp: null,
        });

        existingEvents.forEach((existingEvent) => {
            expect(existingEvent.replaced_timestamp).toBeDefined();
            expect(existingEvent.version).toBe("1.0.1");
          });

    })

    it("Get deployLog", async () => {
        const newEvent = {"application": "testApp", "version": "1.0.0", "environment": "test","environmentClass": "test", "deployer": "Fake Fake"};
        const updatedEvent = {"application": "testApp2", "version": "1.0.1", "environment": "p","deployer": "Fake Fake"};
        const testApp3 = {"application": "testApp3", "version": "1.0.1", "environment": "p:kube","environmentClass": "p", "deployer": "Fake Fake"};
        const testApp4 = {"application": "testApp4", "version": "1.0.0", "environment": "u", "deployer": "Fake Fake"};
        
        const savedEvent = await registerEvent(newEvent)
        expect(savedEvent).toHaveProperty('_id')
        expect(savedEvent).toHaveProperty('replaced_timestamp')

        const savedEventUpdate = await registerEvent(updatedEvent)
        expect(savedEventUpdate).toHaveProperty('_id')
        expect(savedEventUpdate).toHaveProperty('replaced_timestamp')

        await registerEvent(testApp4)

        const deployLogEvents: IEventEnriched[] = await deployLog({});  // Empty search params
        expect(deployLogEvents.length).toBeLessThanOrEqual(3);
        
        await registerEvent(testApp3)
        const query: IQueryParameter = {"onlyLatest": "true", "filterUndeployed": "true", "application": "testApp3"};
        const deployLogEvents2: IEventEnriched[] = await deployLog(query);
        deployLogEvents2.forEach((event) => {
            expect(event.newDeployment).toBeTruthy()
            expect(event.namespace).toBeDefined()
            expect(event.cluster).toBe("kube")
            expect(event.momentTimestamp).toBeDefined()
        })

        const query2: IQueryParameter = {"onlyLatest": "true", "filterUndeployed": "no", "csv": "true"};
        const deploLogEventsEmptyQuery = await deployLog(query2);
        expect(deploLogEventsEmptyQuery.length).toBe(4)

        //const fakeQuery: IQueryParameter = {"filterUndeployed2": "no"};
        //const deploLogEventsFakeQuery = await deployLog(fakeQuery);
        //expect(await deployLog(fakeQuery)).toThrow(Error)
        //expect(await deployLog(fakeQuery)).toThrow('Unknown parameter provided: filterUndeployed2. Valid parameters are: application, environment, deployer, environmentClass, version, last, onlyLatest, filterUndeployed')
    })

    it("Get deploylog in csv format", async() => {
        const testApp = {"application": "testApp", "version": "1.0.0", "environment": "test","environmentClass": "test", "deployer": "Fake Fake"};
        const testApp2 = {"application": "testApp2", "version": "1.0.1", "environment": "p","environmentClass": "p", "deployer": "Fake Fake"};
        const testApp3 = {"application": "testApp3", "version": "1.0.1", "environment": "p:kube","environmentClass": "p", "deployer": "Fake Fake"};
        await registerEvent(testApp)
        await registerEvent(testApp2)
        await registerEvent(testApp3)

        const deployInfo = await deployLog({"application": "testApp3"})
        const csvOutput = await returnCSVPayload(deployInfo)

        const csvRegex =/^(\n)((?:[^,"\n]+|"(?:[^"]|"")*")+)(\n(?:,(?:[^,"\n]+|"(?:[^"]|"")*"))*)*(\n)$/
        csvRegex.test(String(csvOutput))
        
    })

    it("Undeploy an eksisting app", async() => {
        const testApp = {"application": "testApp", "version": "1.0.0", "environment": "test", "deployer": "Fake Fake"};
        await registerEvent(testApp)
        const checkApp = await deployLog({"application": "testApp", "onlyLatest": "true", "filterUndeployed": "true"})
        expect(checkApp.length).toBe(1)
        expect(checkApp[0].version).toEqual("1.0.0")

        const testAppUndeployed = {"application": "testApp", "environment": "test", "deployer": "Fake Fake"};
        await registerEvent(testAppUndeployed)
        const appUndeployed = await deployLog({"application": "testApp", "onlyLatest": "true", "filterUndeployed": "true"})
        expect(appUndeployed.length).toBe(0)

    })

    it("Get deployLog for last 1d", async() => {
        const testApp = {"application": "testApp", "version": "1.0.0", "environment": "test","environmentClass": "test", "deployer": "Fake Fake"};
        await registerEvent(testApp)

        const deployEvents = await deployLog({"last": "1d"})
        expect(deployEvents.length).toBe(1)
        
        /* await deployLog({"last": "one day"})
        expect("fromMomentFormatToActualDate").toThrow(Error) */
        
    })

    it("Test getConfig", () => {
        const config = getConfig()
        expect(config.dbUrl).toBe("mongodb://127.0.0.1/deploy_log")
        expect(config.dbUser).toBe(process.env["VERA_USERNAME"])

    })
})