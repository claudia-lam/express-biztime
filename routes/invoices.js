'use strict';

const express = require("express");

const db = require("../db");
const router = new express.Router();
const { NotFoundError, BadRequestError } = require("../expressError");

/** GET - Return info on invoices
 *
 * >> {invoices: [{id, comp_code}, ...]}
 */
router.get("", async function (req, res, next) {   //TODO: optional: order by query
  const result = await db.query(
    `SELECT id, comp_code
     FROM   invoices;
    `
  );

  const invoices = result.rows;

  return res.json({ invoices });
});


/** GET - Returns obj on given invoice
 *
 * >> {invoice: {id, amt, paid, add_date, paid_date, company:
 *    {code, name, description}}}
 *
 */
router.get("/:id", async function (req, res, next) {
  const id = req.params.id;

  const invoiceResults = await db.query(
    `
    SELECT id, amt, paid, add_date, paid_date
    FROM   invoices
    WHERE  id = $1;
    `,
    [id],
  );

  const invoice = invoiceResults.rows[0];

  if (!invoiceResults) throw new NotFoundError();

  const companyResults = await db.query(
    `
    SELECT code, name, description
    FROM   companies
    JOIN   invoices
      ON   code = comp_code
    WHERE  id = $1;
    `,
    [id],
  );

  const company = companyResults.rows[0];


  invoice.company = company;

  return res.json({ invoice });
});


/**
 *  POST - create a new invoice
 * TODO: always add example inputs
 *  >> {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post('', async function (req, res, next) {
  if (!req.body) throw new BadRequestError();       //TODO: empty object when nothing is passed in (truthy value)

  const { comp_code, amt } = req.body;

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt],
  );

  const invoice = results.rows[0];

  return res.status(201).json({ invoice });
});


/**
 * PUT - updates a invoice
 *  //TODO: add input example
 * >> {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put('/:id', async function (req, res, next) {
  if (!req.body) throw new BadRequestError();    //TODO: more specific if condition with empty object(truthy value)

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

  return res.json({ invoice });
});


/**
 * DELETE - deletes an invoice
 *
 * >> {status: "deleted"}
 */

router.delete('/:id', async function (req, res, next) {
  const id = req.params.id;

  const result = await db.query(
    `
    DELETE FROM invoices
      WHERE     id = $1
      RETURNING id`,
    [id],
  );

  if (!result) throw new NotFoundError();

  return res.json({ status: "deleted" });
});


module.exports = router;