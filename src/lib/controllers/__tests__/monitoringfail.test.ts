import { selftest } from "../monitoring"

describe("Test monitoring service Fail", () => {
    it("Check selftest when no database connection", async () => {
        const selftestResult = await selftest()
        expect(selftestResult.statusCode).toBe(400)
        expect(selftestResult.checks[0].result).not.toBe("connected")
        expect(selftestResult.checks[0].result).toBe("disconnected")
    })
})
