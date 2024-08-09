const bcrypt = require("bcrypt");
const https = require("https");

const User = require("../models/user");

exports.userCreate = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created!",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
};

exports.userLogin = (req, res, next) => {
  let _token;
  let _expiresIn;
  let _orgId;

  const postData = JSON.stringify({
    email: req.body.email,
    password: req.body.password,
  });

  const options = {
    host: process.env.JITTERBIT_HOST,
    path: "/jitterbit-cloud-restful-service/user/login",
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
    protocol: "https:",
  };

  const localReq = https.request(options, (apiRes) => {
    let statusCode = apiRes.statusCode;
    let responseBody = "";

    apiRes.setEncoding("utf8");
    apiRes.on("data", (chunk) => {
      responseBody += chunk;
    });

    apiRes.on("end", () => {
      if (statusCode === 200) {
        _errorMessage = "";
        try {
          let jsonObject = JSON.parse(responseBody);
          if (jsonObject.status === false) {
            throw Error(jsonObject.errorMessage);
          }

          _token = jsonObject.authenticationToken;
          _expiresIn = jsonObject.sessionTimeoutInSeconds;
          _orgId = jsonObject.defaultOrgId;

          // Respond only after receiving the full data and parsing the JSON
          res.status(200).json({
            token: _token,
            expiresIn: _expiresIn,
            orgId: _orgId,
          });
        } catch (e) {
          if (e.message === "") {
            res.status(500).json({ message: "Error parsing response!" });
          } else {
            res.status(401).json({message: e.message});
          }
        }
      } else {
        res.status(statusCode).json({
          message: responseBody,
        });
      }

      console.log("No more data in response.");
    });
  });

  localReq.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
    res.status(500).json({ message: `Request failed: ${e.message}` });
  });

  // Write data to request body
  localReq.write(postData);
  localReq.end();
};
