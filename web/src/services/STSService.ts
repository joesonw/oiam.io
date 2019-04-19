import {
    Ref,
    Token,
    Credential,
} from 'models';
import * as SHA1 from 'js-sha1';
import handleHttp from './handleHttp';

function sign(obj: any, secret: string) {
    const keys = Object.keys(obj).sort();
    const pairs = keys.map((key) => {
        let v = obj[key];
        const type = typeof v;
        if (type !== 'string' && type !== 'number') {
            v = JSON.stringify(v);
        }
        return (`${key}=${v}`);
    });
    const h = SHA1.create();
    h.update(`${pairs.join('&')}${secret}`);
    return h.hex();
}

export default class STSService {
    static auth(key: string, secret: string): Promise<Token> {
        const req: any = {
            key,
            durationSeconds: 3600,
            currentTimeSeconds: Math.floor(Date.now() / 1000),
            nonce: Math.random().toString(),
        };
        req.signature = sign(req, secret);

        return handleHttp('/sts/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        });
    }


    static assume(name: string, durationSeconds: number, role: Ref): Promise<Credential> {
        const req: any = {
            name,
            durationSeconds,
            role,
        };

        return handleHttp('/sts/assume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        });
    }
}
