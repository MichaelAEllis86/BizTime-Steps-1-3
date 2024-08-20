const ExpressError = require("./expressError")

function isValidRequestBodyCompanies(req,res,next){
    try{
        if(!req.body.code || !req.body.name || !req.body.description ){
            throw new ExpressError("Bad Request! Missing JSON data! Please include json for your company in the request body in the following format----> {'code':'Dell', 'name':'Dell INC', 'description':'box computer retailer'}!",400)
        }
        // very important call of next() here. If it isn't called we can't move onto the route handler or next middleware.
        next();
    }
    catch(err){
        return next(err);
    }
}


// Adds an invoice.
// Needs to be passed in JSON body of: {comp_code, amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}


function isValidRequestBodyAddInvoice(req,res,next){
    try{
        if(!req.body.comp_code || !req.body.amt){
            throw new ExpressError("Bad Request! Missing JSON data! Please include json for your invoice in the request body in the following format----> {'comp_code':'apple', 'amt':150.25}",400)
        }
        // very important call of next() here. If it isn't called we can't move onto the route handler or next middleware.
        next();
    }
    catch(err){
        return next(err);
    }
}

function isValidRequestBodyUpdateInvoice(req, res, next){
    try{
        if(!req.body.amt){
            throw new ExpressError("Bad Request! Missing JSON data! Please include json for your invoice in the request body in the following format----> {'amt':150.25}",400)
        }
        // very important call of next() here. If it isn't called we can't move onto the route handler or next middleware.
        next();
    }
    catch(err){
        return next(err);
    }

    }


module.exports={isValidRequestBodyCompanies:isValidRequestBodyCompanies,
                isValidRequestBodyAddInvoice:isValidRequestBodyAddInvoice,
                isValidRequestBodyUpdateInvoice:isValidRequestBodyUpdateInvoice
            }
