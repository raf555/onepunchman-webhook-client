const { createHmac, timingSafeEqual } = require("crypto");

/**
 * Secure compare using timingSafeEqual to avoid timing attack 
 * @param {Buffer} a 
 * @param {Buffer} b 
 * @returns {boolean}
 */
function secureCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return timingSafeEqual(a, b);
}

/**
 * Validate incoming webhook using this function
 * @param {Express.Request} req request
 * @returns {boolean}
 */
function signatureValidation(req) {
    const OPMSignature = req.header("opm-signature-sha256");
    if (!OPMSignature) return false;

    let secret = process.env.opm_secret || ""; // your secret key, safely stored in environment variable

    let signbuf = Buffer.from(OPMSignature, "base64");
    let mysign = createHmac("SHA256", secret).update(JSON.stringify(req.body)).digest();

    return secureCompare(signbuf, mysign);
}

module.exports = {
    signatureValidation
}
