/* eslint-disable no-console */
import server from "./src";
import { logsError } from "./src/lib/utils";
import { mongooseConnection } from "./src/mongodb";

let db;
// eslint-disable-next-line no-undef
const port = 8020;

(async () => {
  try {
    db = await mongooseConnection();
    if (db) {
      console.time(
        `⚡️ game server started with 👍🏼 database connected & redis connected http://localhost:${port} in`
      );
      server.listen(port, () => {
        console.timeEnd(
          `⚡️game server started with 👍🏼 database connected http://localhost:${port} in `
        );
      });
    }
  } catch (error) {
    console.log(error);
    logsError(error);
    console.timeEnd(
      `👎🏻 database or redis connection has some problem : ${JSON.stringify(
        error
      )}`
    );
  }
})();

export default db;
