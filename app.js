const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const cors = require("cors");
require("dotenv").config();
const creds = require("./secret.json");

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);

app.get("/getData", async (req, res) => {
  try {
    let arrData = [];

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    for (let i = 0; i < rows.length; i++) {
      arrData.push({
        id:rows[i].get("ID"),
        avatarname:rows[i].get("Avatar Name"),
        performancescore:rows[i].get("Performance Score"),
    });
    }
    res.status(200).json(arrData);
  } catch (error) {
    console.error(error);
  }
});
app.post("/addData", async (req, res) => {
  try {
    const data = req.body;
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
        "ID": data.id,
        "Avatar Name": data.avatarname,
        "Performance Score": data.performancescore,
    });
    res.status(200).send('added');
  } catch (error) {
    console.error(error);
  }
});

app.listen(3001, () => {
  console.log(`Server is running on port 3001`);
});
