import mongoose, { Mongoose } from "mongoose"
import config from "./config/config"

declare global {
    // eslint disabled for line under because of no support for let/const
    // eslint-disable-next-line
    var mongoose: {
        conn: null | Mongoose
        promise: null | Promise<Mongoose>
    }
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
    //console.log(config.dbUrl);
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auth: {
                username: config.dbUser,
                password: config.dbPassword,
            },
        }
        cached.promise = mongoose.connect(config.dbUrl, opts).then((mongoose) => {
            return mongoose
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }

    console.log("connected to db")
    return cached.conn
}

export default connectDB
