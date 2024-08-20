const express=require("express");
const router=new express.Router();
const morgan=require("morgan");
const ExpressError = require("../expressError");
// const { route } = require("../app");
const db = require("../db");
const middleware=require("../middleware");

router.use(morgan("dev"));

// GET all invoices
router.get("/", async function getAllInvoices(req,res,next){
    try{
        const results=await db.query(`SELECT * FROM invoices`)
        console.log("this is results ---->" , results)
        console.log("this is results.rows ---->" , results.rows)
        return res.json({invoices:results.rows});
    }
    catch(err){
        return next(err)
    }
})


//GET info for an invoice using route paramater/:id.
// Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

router.get("/:id", async function getInvoice(req,res,next){
    try{
        let id=req.params.id
        const results=await db.query(`SELECT i.id, 
                  i.comp_code, 
                  i.amt, 
                  i.paid, 
                  i.add_date, 
                  i.paid_date, 
                  c.name, 
                  c.description 
           FROM invoices AS i
             INNER JOIN companies AS c ON (i.comp_code = c.code)  
           WHERE id = $1`,
        [id])
        // console.log("this is the result ---->" , results)
        // console.log("this is the result.rows ---->" , results.rows)
        if (results.rows.length===0){
            throw new ExpressError("invoice not found",404)
            }
        let data=results.rows[0]
        console.log("this is data-------->",data)
        let formattedData={invoice:{id:data.id,
                                    amt:data.amt,
                                    paid:data.paid,
                                    add_date:data.add_date,
                                    paid_date:data.paid_date,
                                    company:{code:data.comp_code,
                                            name:data.name,
                                            description:data.description,
                                    }}}
        return res.send(formattedData);
    }   
    catch(err){
        return next(err)
    }
})

// POST a new invoice using request body data. Validates request body format.
// Needs to be passed in JSON body of: {comp_code, amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post("/",middleware.isValidRequestBodyAddInvoice, async function addInvoice(req,res,next){
    try{
        console.log("this is the request body---->", req.body)
        const results=await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,[req.body.comp_code,req.body.amt])
        console.log("this is the result ---->" , results)
        console.log("this is the result.rows ---->" , results.rows)
        return res.status(201).json({newInvoice : results.rows[0]})
    }
    catch(err){
        return next(err)
    }
})

// PUT /invoices/[id] Updates an existing invoice with an amt using request body data. Validates request body format. 
// Updates an invoice.
// If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of {amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.put("/:id",middleware.isValidRequestBodyUpdateInvoice, async function updateInvoice(req, res, next){
    try{
        console.log("this is the request body---->", req.body)
        let id=req.params.id
        const results=await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,[req.body.amt,id])
        console.log("this is the result ---->" , results)
        console.log("this is the result.rows ---->" , results.rows)
        if (results.rows.length===0){
            throw new ExpressError("invoice not found",404)
            }
        return res.json({invoice:results.rows[0]})

    }
    catch(err){
        return next(err)
    }
})

//DELETE /invoices/[id]: deletes a invoice based on the route parameter
router.delete("/:id", async function deleteInvoice(req,res,next){
    try{
        let id=req.params.id
        const checkIdQuery=await db.query(`SELECT * FROM invoices WHERE id =$1`, [id])
        if (checkIdQuery.rows.length===0){
            throw new ExpressError("invoice not found",404)
            }
        const results=await db.query(`DELETE FROM invoices WHERE id=$1`,[id])
        return res.json({status:"Deleted"});

    }
    catch(err){
        return next(err)
    }
})


// CREATE TABLE invoices (
//     id serial PRIMARY KEY,
//     comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
//     amt float NOT NULL,
//     paid boolean DEFAULT false NOT NULL,
//     add_date date DEFAULT CURRENT_DATE NOT NULL,
//     paid_date date,
//     CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
// );




module.exports=router