import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import Joi from "joi";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { isRecord } from "~/common/types";
import { sceneHash } from "../helpers/hash";
import { ButtonType } from "./enums/button-type.enum";
import { State } from "../types/scenes";

const callbackDataSchema = Joi.object<{
    h: number;
    p: unknown;
}>({
    h: Joi.number().required(),
    p: Joi.exist().required(),
});

@Injectable()
export class TelegramButtonService {
    private readonly logger = new Logger(TelegramButtonService.name);

    static parseCallbackButtonPayload(data: string): {
        hash: number;
        payload: unknown;
    } {
        const jsonData: unknown = JSON.parse(data);

        if (!isRecord(jsonData)) {
            throw new BadRequestException("Payload is not a record");
        }

        const { error, value } = callbackDataSchema.validate(jsonData);

        if (error) {
            throw new BadRequestException("Payload is not valid");
        }

        return { hash: value.h, payload: value.p };
    }

    addPrevNextButtons(options: {
        state: State;
        buttons: InlineKeyboardButton.CallbackButton[][];
        totalItems: number;
        currentPage: number;
        itemsPerPage: number;
    }): InlineKeyboardButton.CallbackButton[][] {
        const controls: InlineKeyboardButton.CallbackButton[] = [];

        if (options.currentPage > 0) {
            controls.push(this.buildPrevButton(options.state));
        }

        if (
            options.totalItems >
            (options.currentPage + 1) * options.itemsPerPage
        ) {
            controls.push(this.buildNextButton(options.state));
        }

        if (controls.length) {
            return [...options.buttons, controls];
        }

        return options.buttons;
    }

    buildPrevButton(state: State): InlineKeyboardButton.CallbackButton {
        return this.buildCallbackButton({
            state,
            text: "<-",
            payload: ButtonType.PREVIOUS,
        });
    }

    buildNextButton(state: State): InlineKeyboardButton.CallbackButton {
        return this.buildCallbackButton({
            state,
            text: "->",
            payload: ButtonType.NEXT,
        });
    }

    buildCallbackButton(options: {
        state: State;
        text: string;
        payload: unknown;
    }): InlineKeyboardButton.CallbackButton {
        const hash = sceneHash({
            scene: options.state.scene,
            step: options.state.step,
            stepEnteredAt: options.state.stepEnteredAt,
        });

        return {
            text: options.text,
            callback_data: JSON.stringify({ h: hash, p: options.payload }),
        };
    }
}
