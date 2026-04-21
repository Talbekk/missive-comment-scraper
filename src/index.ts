import { fetchAllComments } from "./commands/fetchAllComments/index.ts";

const main = async (): Promise<void> => {
  await fetchAllComments();
};

await main();
