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


/**
 *  POST - create a new invoice
 *
 *  >> {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post('', async function(req, res, next) {
  if (!req.body) throw new BadRequestError();

  const { comp_code, amt } = req.body;

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt],
  );

  const invoice = results.rows[0];

  return res.status(201).json({invoice});
});


/**
 * PUT - updates a invoice
 *
 * >> {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put('/:id', async function(req, res, next) {
  if (!req.body) throw new BadRequestError();

  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
      SET amt=$1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, req.params.id],
  );

  const invoice = result.rows[0];

  if (!invoice) throw new NotFoundError();

  return res.json({invoice});
});


/**
 * DELETE - deletes an invoice
 *
 * >> {status: "deleted"}
 */

router.delete('/:id', async function(req, res, next) {
  const id = req.params.id;
  console.log("id-delete", id);
  const result = await db.query(
    `
    DELETE FROM invoices
      WHERE     id = $1
      RETURNING id`,
    [id],
  );

  if (!result) throw new NotFoundError();

  return res.json({status: "deleted"});
});


module.exports = router;