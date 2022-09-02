import { APIUser, normalizeArray, ReactionCollector, ReactionCollectorOptions, RestOrArray, User } from 'discord.js';
import { PaginationControllerType } from '../types/pagination';
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

export interface PaginationReaction {
    id: string|null;
    name: string;
    type: Omit<PaginationControllerType, "Custom">;
}

export interface ReactionPaginationOptions extends PaginationBaseOptions {
    reactions?: PaginationReaction[];
    onDisableAction?: ReactionPaginationOnDisableAction|keyof typeof ReactionPaginationOnDisableAction;
    authorIndependent?: boolean;
    singlePageNoReactions?: boolean;
    timer?: number;
    authorId?: string|User|APIUser|null;
    collectorOptions?: Omit<ReactionCollectorOptions, "timer">;
}

export class ReactionPagination extends PaginationBase {
    protected _reactions: PaginationReaction[] = [];
    protected _onDisableAction: ReactionPaginationOnDisableAction = ReactionPaginationOnDisableAction.RemovePaginationReactions;
    protected _authorIndependent: boolean = true;
    protected _singlePageNoReactions: boolean = true;
    protected _timer: number = 20000;
    protected _authorId: string|null = null;
    protected _collector: ReactionCollector|null = null;
    protected _collectorOptions?: ReactionCollectorOptions;

    get reactions() { return this._reactions; }
    get onDisableAction() { return this._onDisableAction; }
    get authorIndependent() { return this._authorIndependent; }
    get singlePageNoReactions() { return this._singlePageNoReactions; }
    get timer() { return this._timer; }
    get authorId() { return this._authorId; }
    get collector() { return this._collector; }
    get collectorOptions() { return this._collectorOptions; }

    set reactions(reactions: Required<ReactionPaginationOptions>["reactions"]) { this._reactions = reactions; }
    set onDisableAction(action: Required<ReactionPaginationOptions>["onDisableAction"]) { this.setOnDisableAction(action); }
    set authorIndependent(authorIndependent: Required<ReactionPaginationOptions>["authorIndependent"]) { this.setAuthorIndependent(authorIndependent); }
    set singlePageNoReactions(singlePageNoReactions: Required<ReactionPaginationOptions>["singlePageNoReactions"]) { this.setSinglePageNoReactions(singlePageNoReactions); }
    set timer(timer: Required<ReactionPaginationOptions>['timer']) { this.setTimer(timer); }
    set authorId(author: Required<ReactionPaginationOptions>['authorId']) { this.setAuthorId(author); }
    set collectorOptions(options: ReactionPaginationOptions['collectorOptions']) { this._collectorOptions = options; }

    /**
     *  Sets disable interaction interval in milliseconds
     * @default 20000
     */
    public setTimer(timer: number): this {
        if (!isNaN(Number(timer))) {
            this._timer = timer;
        } else {
            throw new TypeError('Invalid ttimer');
        }
        
        return this;
    }

    /**
     * Set if the pagination should only work for pagination author 
     * @default true
     */
    public setAuthorIndependent(authorIndependent: boolean): this {
        this._authorIndependent = authorIndependent;
        return this;
    }

    /**
     * Set what action would happen on pagination timeout
     * @default ReactionPaginationOnDisableAction.DisableComponents
     */
    public setOnDisableAction(action: ReactionPaginationOnDisableAction|keyof typeof ReactionPaginationOnDisableAction): this {
        this._onDisableAction = typeof action === 'string' ? ReactionPaginationOnDisableAction[action] : action;

        return this;
    }

    /**
     * Set if pagination should add reactions if there's only single page 
     * @default true
     */
    public setSinglePageNoReactions(singlePageNoReactions: boolean): this {
        this._singlePageNoReactions = singlePageNoReactions;
        return this;
    }

    /**
     * Sets the pagination author Id
     */
    public setAuthorId(authorId?: string|User|APIUser|null): this {
        if (typeof authorId == 'string') {
            this._authorId = authorId;
        } else if (authorId !== null && authorId !== undefined) {
            this._authorId = authorId.id;
        } else {
            this._authorId = null;
        }

        return this;
    }

    /**
     * Adds reaction controller
     */
    public addReactions(...reactions: RestOrArray<PaginationReaction>): this {
        this._reactions.push(...normalizeArray(reactions));

        return this;
    }
}