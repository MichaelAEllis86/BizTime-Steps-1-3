const express=require("express");
const router=new express.Router();
const morgan=require("morgan");
const ExpressError = require("../expressError");
// const { route } = require("../app");
const db = require("../db");
const middleware=require("../middleware");


//
router.use(morgan("dev"));

// GET all companies
router.get("/", async function getAllCompanies(req,res,next){
    try{
        const results=await db.query(`SELECT * FROM companies`)
        console.log("this is results ---->" , results)
        console.log("this is results.rows ---->" , results.rows)
        return res.json({companies:results.rows});
    }
    catch(err){
        return next(err)
    }
})

// GET a company based on route param
router.get("/:code", async function getCompanyByCode(req,res,next){
    try{
        let companyCode=req.params.code
        //parameterized query
        const results=await db.query(`SELECT * FROM companies WHERE code =$1`, [companyCode])
        console.log("this is the result ---->" , results)
        console.log("this is the result.rows ---->" , results.rows)
        // if we dont get anything in results.rows we throw a 404
        if (results.rows.length===0){
            throw new ExpressError("Company not found",404)
            }
            return res.json({company:results.rows});
        }
    catch(err){
        return next(err)
    }
})

// POST a new company via data in the request body. Validates request body format.
router.post("/", middleware.isValidRequestBodyCompanies, async function addCompany(req,res,next){
    try{
        console.log("this is the request body---->", req.body)
        const results=await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [req.body.code, req.body.name, req.body.description])
        return res.status(201).json({newCompany : results.rows[0]})

    }
    catch(err){
        return next(err)

    }
})

// UPDATE an existing company based on route param
router.put("/:code", async function updateCompany(req,res,next){
    try{
        let companyCode=req.params.code
        const results=await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [req.body.name, req.body.description, companyCode])
        console.log("this is the result ---->" , results)
        console.log("this is the result.rows ---->" , results.rows)
        return res.send(results.rows[0]);
    }
    catch(err){
        return next(err)
    }
    

})

// DELETE an existing company based on route param (Delete operation works on database were)
router.delete("/:code", async function deleteCompany(req,res,next){
    try{
        let companyCode=req.params.code
        // I just a did separate query to check if the company we target for deletion is there or not. Can
        const checkCodeQuery=await db.query(`SELECT * FROM companies WHERE code =$1`, [companyCode])
        // if company is missing from db throw 404
        if (checkCodeQuery.rows.length===0){
            throw new ExpressError("Company not found",404)
            }
        // if we get this far do the deletion operation
        const results=await db.query(`DELETE FROM companies WHERE code=$1`,[companyCode])
        return res.json({status:"Deleted"});
    }
    catch(err){
        return next(err)
    }
   


})

module.exports=router