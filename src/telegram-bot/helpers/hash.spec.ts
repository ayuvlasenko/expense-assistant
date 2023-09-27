import { validateSceneHash, sceneHash } from "./hash";

describe("hash", () => {
    const options = {
        scene: "login",
        step: "enter_password",
        stepEnteredAt: new Date("2022-01-01T00:00:00.000Z"),
    };
    const expectedHash = -761961792;

    describe("sceneHash", () => {
        it("generates a hash based on the scene, step, and date", () => {
            const hash = sceneHash(options);

            expect(hash).toEqual(expectedHash);
        });
    });

    describe("validateSceneHash", () => {
        it("returns true if the hash matches the options", () => {
            expect(validateSceneHash(expectedHash, options)).toEqual(true);
        });

        it("returns false if the hash does not match the options", () => {
            expect(
                validateSceneHash(expectedHash, {
                    ...options,
                    step: "enter_username",
                }),
            ).toEqual(false);
        });
    });
});
