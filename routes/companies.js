const express = require("express");

const db = require("../db");
const router = new express.Router();
const { NotFoundError } = require("../expressError");

router.get("", async function(req, res, next) {
  //get all companies from db
  const result = await db.query(
    `SELECT code, name
        FROM companies
    `
  )
  const companies = result.rows;
  // console.log("companies", companies);
  //return all companies in json
  return res.json({companies});
})

router.get("/:code", async function(req, res, next) {
  const companyCode = req.params.code;
  //get all companies from db
  const result = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`, [companyCode]);
  const company = result.rows[0];
  console.log("company", company);

  //if comp doesn't exist return 404
  if (result.rows.length === 0) throw new NotFoundError;

  return res.json({company});
})

module.exports = router;