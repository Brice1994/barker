
(async () => {
  const monk = require("monk");
  const route = `mongodb://${process.env.USER}:${process.env.AUTHKEY}@sezzle-web-calculator-shard-00-00.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-01.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-02.urh1h.mongodb.net:27017/barks?ssl=true&replicaSet=atlas-qic6uj-shard-0&authSource=admin&retryWrites=true&w=majority`

  const db = monk(route || "localhost/barker");
  const barks = db.get("barks");
  await barks.bulkWrite([
    {deleteMany: {filter: {}}}
  ]);
  db.close();
})();

