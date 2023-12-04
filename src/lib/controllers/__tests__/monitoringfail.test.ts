
describe("Test monitoring service Fail", () => {

    it("Check selftest when no database connection", async () => {
        jest.mock('../../db/db', () => {
            connectDB: jest.fn(() => {return null});
        });
        const refreshModule = await import('../monitoring');
        const selftestResult = await refreshModule.selftest();
        //console.log("SelftestFailed",selftestResult);
        expect(selftestResult.statusCode).toBe(400);
        expect(selftestResult.checks[0].result).not.toBe("connected");
        expect(selftestResult.checks[0].result).toBe("disconnected");
    })
})