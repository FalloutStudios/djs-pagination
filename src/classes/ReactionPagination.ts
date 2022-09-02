import { APIUser, ReactionCollector, ReactionCollectorOptions, User } from 'discord.js';
import { PaginationBase, PaginationBaseOptions } from './base/PaginationBase';

export enum ReactionPaginationOnDisableAction {
    /**
     * Do nothing but will disable interacting with the pagination. 
     */
    None,
    /**
     * Delete the sent pagination message
     */
    DeleteMessage,
    /**
     * Remove pagination reactions
     */
    RemovePaginationReactions,
    /**
     * Clear all message reactions
     */
    ClearAllReactions
}

export interface ReactionPaginationOptions extends PaginationBaseOptions {
    onDisable?: ReactionPaginationOnDisableAction|keyof ReactionPaginationOnDisableAction;
    authorIndependent?: boolean;
    singlePageNoReactions?: boolean;
    timer?: number;
    authorId?: string|User|APIUser;
    collectorOptions?: Omit<ReactionCollectorOptions, "timer">;
}

export class ReactionPagination extends PaginationBase {
    
}