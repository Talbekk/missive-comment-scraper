import { getComments, MissiveComment } from "../../api/getComments/index.ts";

const PAGE_LIMIT = 100;

export const fetchAllComments = async () => {
    let allComments: MissiveComment[] = [];
    let until: number | undefined = undefined;

    while (true) {
        const response = await getComments({ limit: PAGE_LIMIT, until });
        allComments = allComments.concat(response.comments);

        if (response.comments.length < PAGE_LIMIT) {
            break;
        }

        until = response.comments[response.comments.length - 1].created_at;
    }
    console.log(`Fetched ${allComments.length} comments.`);
    console.log(allComments);
    return allComments;
};