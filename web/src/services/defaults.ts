import {
    Token,
} from '../models';

export const URL = API_URL;

let token: Token;

export function getToken() { return token; }

export function setToken(mToken: Token) { token = mToken; }
