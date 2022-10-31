import { ButtonBuilder, InteractionButtonComponentData } from 'discord.js';
import { PaginationControllerType } from './enums';

export enum ButtonsOnDisable {
    RemoveComponents = 1,
    DisableComponents,
    DeletePagination,
    Ignore
}

export interface Button {
    builder: ButtonBuilder;
    type: PaginationControllerType;
}

export interface RawButton {
    builder: ButtonBuilder|InteractionButtonComponentData;
    type: PaginationControllerType|keyof typeof PaginationControllerType;
}