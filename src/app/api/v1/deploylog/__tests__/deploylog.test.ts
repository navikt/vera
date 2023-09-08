import mongoose from 'mongoose';
import config from '../../../../../lib/config/config';

jest.mock('mongoose');

describe('deploylog route', () => {

    beforeAll(async () => {
        const url = config.dbUrl
        const opts = {
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }
        await mongoose.connect(url, opts);
    })

    it("Test Get", async () => {

        //expect(mongoose.connect).toHaveBeenCalledWith(config.dbUrl, expect.any(Object)); 

    })

})