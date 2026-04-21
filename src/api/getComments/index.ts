export interface MissiveComment {
    id: string,
    body: string,
    mentions: any[],
    created_at: number,
    meta: any[],
    task: any,
    attachment: any,
    author: any
};

interface GetCommentsResponse {
    comments: MissiveComment[];
};

interface GetCommentsParams {
    limit?: number;
    until?: number;
};

export const getComments = async (
    params: GetCommentsParams = {}
): Promise<GetCommentsResponse> => {
    const url = new URL(`https://public.missiveapp.com/v1/conversations/${process.env.CONVERSATION_ID}/comments`);

    if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));
    if (params.until !== undefined) url.searchParams.set("until", String(params.until));

    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${process.env.MISSIVE_API_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    return response.json() as Promise<GetCommentsResponse>;
};
