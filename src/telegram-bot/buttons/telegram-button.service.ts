import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import Joi from "joi";
import { InlineKeyboardButton } from "telegraf/types";
import { isRecord } from "~/common/types";
import { stepHash } from "../helpers/hash";
import { State } from "../types/scenes";
import { ButtonType } from "./enums/button-type.enum";

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

    static parsePageButtonData(data: string): number | undefined {
        const { payload } = TelegramButtonService.parseCallbackButtonData(data);

        if (!(typeof payload === "string")) {
            return;
        }

        const [type, page] = payload.split(":");

        if (type !== ButtonType.PAGE) {
            return;
        }

        if (isNaN(Number(page))) {
            return;
        }

        return Number(page);
    }

    static parseCallbackButtonData(data: string): {
        hash: number;
        payload: unknown;
    } {
        const jsonData: unknown = JSON.parse(data);

        if (!isRecord(jsonData)) {
            throw new BadRequestException("Payload is not a record");
        }

        const result = callbackDataSchema.validate(jsonData);

        if (result.error) {
            throw new BadRequestException("Payload is not valid");
        }

        return { hash: result.value.h, payload: result.value.p };
    }

    addPageButtons(options: {
        state: State;
        buttons: InlineKeyboardButton.CallbackButton[][];
        totalItems: number;
        page: number;
        itemsPerPage: number;
    }): InlineKeyboardButton.CallbackButton[][] {
        const controls: InlineKeyboardButton.CallbackButton[] = [];

        if (options.page > 0) {
            controls.push(
                this.buildPageButton(options.state, "<-", options.page - 1),
            );
        }

        if (options.totalItems > (options.page + 1) * options.itemsPerPage) {
            controls.push(
                this.buildPageButton(options.state, "->", options.page + 1),
            );
        }

        if (controls.length) {
            return [...options.buttons, controls];
        }

        return options.buttons;
    }

    buildPageButton(
        state: State,
        text: string,
        page: number,
    ): InlineKeyboardButton.CallbackButton {
        return this.buildCallbackButton({
            state,
            text,
            payload: `${ButtonType.PAGE}:${page}`,
        });
    }

    buildCallbackButton(options: {
        state: State;
        text: string;
        payload: unknown;
    }): InlineKeyboardButton.CallbackButton {
        const hash = stepHash({
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
