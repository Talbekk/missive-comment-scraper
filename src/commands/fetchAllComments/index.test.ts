import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type MissiveComment } from '../../api/getComments/index.ts';
import { fetchAllComments } from './index.ts';

vi.mock('../../api/getComments/index.ts');

import { getComments } from '../../api/getComments/index.ts';

const PAGE_LIMIT = 100;

const makeComment = (id: string, created_at: number): MissiveComment => ({
    id,
    body: 'test body',
    mentions: [],
    created_at,
    meta: [],
    task: null,
    attachment: null,
    author: {
        id: 'author-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
    },
});

const makePage = (count: number, baseTimestamp = 1000): MissiveComment[] =>
    Array.from({ length: count }, (_, i) => makeComment(`comment-${baseTimestamp + i}`, baseTimestamp + i));

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('fetchAllComments', () => {
    it('returns comments when result fits in one page', async () => {
        const comments = [makeComment('1', 100), makeComment('2', 200)];
        vi.mocked(getComments).mockResolvedValue({ comments });

        const result = await fetchAllComments();

        expect(result).toEqual(comments);
        expect(getComments).toHaveBeenCalledTimes(1);
        expect(getComments).toHaveBeenCalledWith({ limit: PAGE_LIMIT, until: undefined });
    });

    it('returns empty array when no comments exist', async () => {
        vi.mocked(getComments).mockResolvedValue({ comments: [] });

        const result = await fetchAllComments();

        expect(result).toEqual([]);
        expect(getComments).toHaveBeenCalledTimes(1);
    });

    it('paginates when first page is full, passing until from last comment', async () => {
        const firstPage = makePage(PAGE_LIMIT, 1000);
        const secondPage = [makeComment('last', 2000)];

        vi.mocked(getComments)
            .mockResolvedValueOnce({ comments: firstPage })
            .mockResolvedValueOnce({ comments: secondPage });

        await fetchAllComments();

        expect(getComments).toHaveBeenCalledTimes(2);
        expect(getComments).toHaveBeenNthCalledWith(1, { limit: PAGE_LIMIT, until: undefined });
        expect(getComments).toHaveBeenNthCalledWith(2, {
            limit: PAGE_LIMIT,
            until: firstPage[PAGE_LIMIT - 1].created_at,
        });
    });

    it('accumulates comments across multiple pages', async () => {
        const firstPage = makePage(PAGE_LIMIT, 1000);
        const secondPage = makePage(PAGE_LIMIT, 2000);
        const thirdPage = makePage(5, 3000);

        vi.mocked(getComments)
            .mockResolvedValueOnce({ comments: firstPage })
            .mockResolvedValueOnce({ comments: secondPage })
            .mockResolvedValueOnce({ comments: thirdPage });

        const result = await fetchAllComments();

        expect(result).toHaveLength(PAGE_LIMIT * 2 + 5);
        expect(getComments).toHaveBeenCalledTimes(3);
    });

    it('passes correct until values across three pages', async () => {
        const firstPage = makePage(PAGE_LIMIT, 1000);
        const secondPage = makePage(PAGE_LIMIT, 2000);
        const thirdPage = [makeComment('final', 3000)];

        vi.mocked(getComments)
            .mockResolvedValueOnce({ comments: firstPage })
            .mockResolvedValueOnce({ comments: secondPage })
            .mockResolvedValueOnce({ comments: thirdPage });

        await fetchAllComments();

        expect(getComments).toHaveBeenNthCalledWith(2, {
            limit: PAGE_LIMIT,
            until: firstPage[PAGE_LIMIT - 1].created_at,
        });
        expect(getComments).toHaveBeenNthCalledWith(3, {
            limit: PAGE_LIMIT,
            until: secondPage[PAGE_LIMIT - 1].created_at,
        });
    });

    it('logs the total comment count', async () => {
        const comments = [makeComment('1', 100), makeComment('2', 200)];
        vi.mocked(getComments).mockResolvedValue({ comments });

        await fetchAllComments();

        expect(console.log).toHaveBeenCalledWith('Fetched 2 comments.');
    });
});
