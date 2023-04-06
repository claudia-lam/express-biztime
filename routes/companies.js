'use strict';

const express = require("express");

const db = require("../db");
const router = new express.Router();
const { NotFoundError, BadRequestError } = require("../expressError");


/** GET - returns all companies
 *
 *  >> {companies: [{code, name}, ...]}
 */
router.get("", async function(req, res, next) {

  const result = await db.query(
    `SELECT code, name
        FROM companies`
  );

  const companies = result.rows;

  return res.json({companies});
});


/** GET - returns a single company
 *
 * >> {company: {code, name, description}}
*/
router.get("/:code", async function(req, res, next) {
  const companyCode = req.params.code;

  const result = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`, [companyCode],
    );

  const company = result.rows[0];

  if (!company) throw new NotFoundError;

  return res.json({company});
});


/** POST - creates a new company
 *
 * req: {code, name, description}
 * >> {company: {code, name, description}}
*/
router.post("", async function(req, res, next) {
  if (!req.body) throw new BadRequestError();

  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
    [code, name, description],
  );

  const company = results.rows[0];

  return res.status(201).json({company});
});


/** PUT - updates a company
 *
 * req: {name, description}
 * >> {company: {code, name, description}}
 */
router.put('/:code', async function(req, res, next) {
  if (!req.body) throw new BadRequestError();

  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
        SET name=$1,
            description=$2
        WHERE code = $3
        RETURNING code, name, description`,
        [name, description, req.params.code],
  );

  const company = result.rows[0];

  if (!company) throw new NotFoundError();

  return res.json({company});
});


/** DELETE - deletes a company
 *
 * >> {status: "deleted"}
 */
router.delete('/:code', async function(req, res, next) {
  const result = await db.query(
    `DELETE FROM companies
        WHERE code = $1
        RETURNING code`,
    [req.params.code],
  );

  const company = result.rows[0];

  if (!company) throw new NotFoundError();

  return res.json({ message: 'Deleted' });
});



module.exports = router;