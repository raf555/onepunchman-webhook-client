const express = require("express");
const { signatureValidation } = require("./utils");
const fs = require("fs");

const app = express();
const port = parseInt(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Securing webhook with middleware */
app.post("/opm", validate, (req, res) => {
    const data = req.body;
    if (data.type === "test") return;
    handleNewChapt(data); // your code here
});

app.listen(port, () => {
    console.info("Server is listening on " + port);
});

/**
 * Handle new chapter(s), your logic here
 * @param {any} data webhook object
 */
function handleNewChapt(data) {
    /* YOUR CODE HERE */
    let filename = data.source === "manga" ? "webhook_manga" : "webhook_webcomic";
    fs.writeFile(filename + ".json", JSON.stringify(data, undefined, 2), "utf-8", () => {
        console.log("write file done");
    });
}

/**
 * Signature Validation middleware (optional but highly recommended)
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns 
 */
/* Securing webhook as middleware (optional, BUT highly recommended) */
function validate(req, res, next) {
    const opmkey = req.header("opmkey");

    let isValid = false;

    /* Validate the incoming webhook */
    if (opmkey && signatureValidation(req)) {
        // if valid, check for incoming webhook type
        const data = req.body;

        if (data.type === "update" || data.type === "test") {
            isValid = true;
        }
    }

    if (isValid) {
        // if valid, send 200 code and opmkey as a response
        res.status(200).type("text/plain").send(opmkey);

        // process the chapter
        next();
    } else { // otherwise give error response
        res.status(400).send("Bad request");
    }
}
