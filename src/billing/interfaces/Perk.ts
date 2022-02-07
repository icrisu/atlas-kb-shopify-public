export interface Perk {
    readonly type?: string;
    readonly code: string;
    readonly percentOff?: number;
    readonly days?: number;
    readonly expiresAt?: string;
}
