const app = require("./main");
let port = process.env.PORT || 5001;

//Mongo DB
require("./config/db");

//Rutes
require("./src/routes")

app.listen(port, () => console.log(`Server run on ${port}`));