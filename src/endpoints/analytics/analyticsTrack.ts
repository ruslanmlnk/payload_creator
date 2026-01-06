import type { PayloadHandler } from 'payload'

export const analyticsTrack: PayloadHandler = (req) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        headersObj[key.toLowerCase()] = value;
    });

    let clientIp = headersObj['x-forwarded-for']?.split(',')[0].trim() ?? '127.0.0.1'
    if (clientIp === '::1') clientIp = '127.0.0.1'


    return new Response(`Track event received ${clientIp}`, { status: 200 });
}
