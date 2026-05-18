import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getComments } from './index.ts';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const CONVERSATION_ID = 'test-conversation-id';
const API_TOKEN = 'test-api-token';
const BASE_URL = `https://public.missiveapp.com/v1/conversations/${CONVERSATION_ID}/comments`;

const mockComment = {
    id: '9f99f232-1f4b-4cee-810a-3a7f334fadbb',
    body: "cool, I'll send them over and make sure we have different ones!",
    mentions: [],
    created_at: 1779099467,
    meta: [],
    task: null,
    attachment: null,
    author: {
        id: 'bcb813a0-78b4-4bff-b69e-7ebf71861788',
        me: true,
        email: 'michael.campbell@gorilla.sc',
        name: 'Michael Campbell',
        avatar_url: 'https://example.com/avatar.jpg',
    },
};

const mockAttachmentComment = {
    id: '205ebe50-cc1a-4a08-a6d9-5faf1b6c0f92',
    body: null,
    mentions: [],
    created_at: 1779095390,
    meta: [],
    task: null,
    attachment: {
        id: 'e73c2bad-420f-457b-af3f-aef5acc167ca',
        filename: 'Adult_2_Edinburgh_Stevenage_18_May_2026.pdf',
        extension: 'pdf',
        url: 'https://attachments-1.missiveapp.com/e73c2bad-420f-457b-af3f-aef5acc167ca/file.pdf',
        media_type: 'application',
        sub_type: 'pdf',
        size: 134642,
        width: null,
        height: null,
    },
    author: {
        id: '785d70bb-05fc-4cd5-a376-8e71960f2b0d',
        email: 'warren.mcfadyen@gorilla.sc',
        name: 'Warren McFadyen',
        avatar_url: 'https://example.com/warren.jpg',
    },
};

beforeEach(() => {
    vi.clearAllMocks();
    process.env.CONVERSATION_ID = CONVERSATION_ID;
    process.env.MISSIVE_API_TOKEN = API_TOKEN;
});

describe('getComments', () => {
    describe('request construction', () => {
        it('calls the correct endpoint with auth header', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [] }),
            });

            await getComments();

            expect(mockFetch).toHaveBeenCalledWith(BASE_URL, {
                headers: { Authorization: `Bearer ${API_TOKEN}` },
            });
        });

        it('omits query params when none provided', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [] }),
            });

            await getComments();

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).not.toContain('limit');
            expect(calledUrl).not.toContain('until');
        });

        it('appends limit query param when provided', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [] }),
            });

            await getComments({ limit: 50 });

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain('limit=50');
        });

        it('appends until query param when provided', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [] }),
            });

            await getComments({ until: 1779095047 });

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain('until=1779095047');
        });

        it('appends both limit and until when both provided', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [] }),
            });

            await getComments({ limit: 100, until: 1779095047 });

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain('limit=100');
            expect(calledUrl).toContain('until=1779095047');
        });
    });

    describe('response handling', () => {
        it('returns parsed comment array', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [mockComment] }),
            });

            const result = await getComments();

            expect(result).toEqual({ comments: [mockComment] });
        });

        it('returns comment with attachment', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [mockAttachmentComment] }),
            });

            const result = await getComments();

            expect(result.comments[0].attachment).toMatchObject({
                filename: 'Adult_2_Edinburgh_Stevenage_18_May_2026.pdf',
                extension: 'pdf',
                media_type: 'application',
            });
        });

        it('returns empty comments array', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ comments: [] }),
            });

            const result = await getComments();

            expect(result).toEqual({ comments: [] });
        });
    });

    describe('error handling', () => {
        it('throws on 401 unauthorized', async () => {
            mockFetch.mockResolvedValue({ ok: false, status: 401 });

            await expect(getComments()).rejects.toThrow('Response status: 401');
        });

        it('throws on 404 not found', async () => {
            mockFetch.mockResolvedValue({ ok: false, status: 404 });

            await expect(getComments()).rejects.toThrow('Response status: 404');
        });

        it('throws on 500 server error', async () => {
            mockFetch.mockResolvedValue({ ok: false, status: 500 });

            await expect(getComments()).rejects.toThrow('Response status: 500');
        });
    });
});
