import { str } from "crc-32";

export function validateStepHash(
    hash: number,
    options: {
        scene: string;
        step: string;
        stepEnteredAt: Date;
    },
): boolean {
    return hash === stepHash(options);
}

export function stepHash(options: {
    scene: string;
    step: string;
    stepEnteredAt: Date;
}): number {
    return str(
        `${options.scene}:${options.step}:${options.stepEnteredAt.getTime()}`,
    );
}
