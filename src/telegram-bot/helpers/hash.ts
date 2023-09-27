import { str } from "crc-32";

export function validateSceneHash(
    hash: number,
    options: {
        scene: string;
        step: string;
        stepEnteredAt: Date;
    },
): boolean {
    return hash === sceneHash(options);
}

export function sceneHash(options: {
    scene: string;
    step: string;
    stepEnteredAt: Date;
}): number {
    return str(
        `${options.scene}:${options.step}:${options.stepEnteredAt.getTime()}`,
    );
}
