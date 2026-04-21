import { getComments, MissiveComment } from "../../api/getComments/index.ts";

export const fetchAllComments = async () => {
    let allComments: MissiveComment[] = [];
    // let until: number | undefined = undefined;

    // while (true) {
        const response = await getComments({ limit: 10 });
        allComments = allComments.concat(response.comments);

        // if (response.comments.length < 100) {
        //     break; // No more comments to fetch
        // }

        // until = response.comments[response.comments.length - 1].created_at;
    // }
    console.log(`Fetched ${allComments.length} comments.`);
    console.log(allComments);
    return allComments;
};