import { getComments } from "./api/getComments/index.ts";

const main = async (): Promise<void> => {
  const response = await getComments({limit: 2});
  console.log(response);
  console.log("missive-comment-scraper");
};

await main();
