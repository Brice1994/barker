const express = require("express");
const cors = require("cors");
const monk = require("monk");
const Filter = require("bad-words");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const app = express();

const route = `mongodb://${process.env.USER}:${process.env.AUTHKEY}@sezzle-web-calculator-shard-00-00.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-01.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-02.urh1h.mongodb.net:27017/barks?ssl=true&replicaSet=atlas-qic6uj-shard-0&authSource=admin&retryWrites=true&w=majority`
const db = monk(route || "localhost/barker");
const barks =db.get("barks");
const filter = new Filter();
const PORT = 5000;

app.enable("trust proxy");

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    content: "Barker!"
  });
});

app.get("/barks", (req, res, next) => {
  let {skip = 0, limit = 5} = req.query;
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 5;

  skip = skip < 0 ? 0 : skip;
  limit = Math.min(50, Math.max(1,limit));

  Promise.all([
      barks.count(),
      barks.find({}, {
        skip,
        limit,
        sort: {
          created: -1
        }
      })
  ]).then(([total, barks]) => {
    res.json({
      barks,
      meta: {
        total,
        skip,
        limit,
        has_more: total - (skip + limit) > 0
      }
    })
  }).catch(next)
})
function isValidBark(bark){
  return bark.name && bark.name.toString().trim().length > 0 && bark.name.toString().trim().length <= 50 &&
      bark.content && bark.content.toString().trim().length > 0 && bark.content.toString().trim().length <= 100;
}

function createBark(req, res, next) {
  if(isValidBark(req.body)){
    const bark = {
      name: filter.clean(req.body.name.toString().trim()),
      content: filter.clean(req.body.content.toString().trim()),
      created: new Date()
    }
    barks.insert(bark).then(created => {
      res.json(created);
    }).catch(next)
  }else {
    res.status(422);
    res.json({
      content: "Name and content required, name needs to be shorter than 50 characters, content cannot be longer than 100 characters"
    });
  }
}
app.post("/barks", createBark);

app.use((req, res) => {
  res.status(500);
  res.json({
    content: []
  })
})

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
})
