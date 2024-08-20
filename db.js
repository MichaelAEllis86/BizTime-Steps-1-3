/** Database setup for BizTime. */
const { Client }=require("pg");

let DB_URI;

// please note we have not yet setup the test db! DO NOT TEST YET!
if (process.env.NODE_ENV === "test"){
    DB_URI="postgresql:///biztime_test";
} else{
    DB_URI="postgres://mooks2022:mookster21@localhost/biztime";
}

//this 
let db=new Client({
    connectionString: DB_URI
});

db.connect();

module.exports=db;
