'use strict';

const express = require("express");

const db = require("../db");
const router = new express.Router();
const { NotFoundError, BadRequestError } = require("../expressError");

/** GET - Return info on invoices
 *
 * >> {invoices: [{id, comp_code}, ...]}
 */
router.get("", async function(req, res, next) {
  const result = await db.query(
    `SELECT id, comp_code
     FROM   invoices;
    `
  )
  console.log("result-invoices", result);

  const invoices = result.rows
  return res.json({invoices});

});


/** GET - Returns obj on given invoice
 *
 * {
	"invoice": {
		"id": 1,
		"amt": "100.00",
		"paid": false,
		"add_date": "2023-04-06T07:00:00.000Z",
		"paid_date": null,
		"company": {
			"code": "apple",
			"name": "Apple Computer",
			"description": "Maker of OSX."
		}
	}
}
 *
 */
router.get("/:id", async function(req, res, next) {
  const id = req.params.id;
  // console.log("IDDDDDDD", id);

  const invoiceResults = await db.query(
    `
    SELECT id, amt, paid, add_date, paid_date
    FROM   invoices
    WHERE  id = $1;
    `,
    [id],
  )
  console.log("invoiceResults", invoiceResults);
  const invoice = invoiceResults.rows[0];

  const companyResults = await db.query(
    `
    SELECT code, name, description
    FROM   companies
    JOIN   invoices
      ON   code = comp_code
    WHERE  id = $1;
    `,
    [id],
  )
  console.log("companyResults", companyResults);
  const company = companyResults.rows[0];

  if (!invoiceResults) throw new NotFoundError;

  invoice.company = company;

  return res.json({invoice});

});



module.exports = router;