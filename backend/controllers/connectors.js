const checkAuth = require("../middleware/check-auth");
const https = require("node:https");
const { json } = require("body-parser");
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');


const Connector = require("../models/connector");
const API_PATH = "/jitterbit-cloud-restful-service/orgs/";

exports.createConnector = (req, res, next) => {
  let token = req.body.token;
  let orgId = req.params.orgId;
  let name = req.body.name;

  const postData = JSON.stringify({
    name: name,
    version: "1.0.0",
  });

  console.log("post connector");

  const options = {
    host: process.env.JITTERBIT_HOST,
    path: API_PATH + orgId + "/connector",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      authToken: token,
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
        try {
          let jsonObject = JSON.parse(responseBody);
          let status = jsonObject.status;

          if (status === true) {
            const newId = jsonObject.id;
            const originalFilePath = process.env.JAR_STAGING_FOLDER + req.file.filename;
            const newFileName =
              req.file.originalname
                .toLowerCase()
                .split(" ")
                .join("-")
                .replace(".jar", "") +
              "." +
              newId +
              "." +
              process.env.MIME_TYPE_MAP[req.file.mimetype];
            const newFilePath = process.env.JAR_STAGING_FOLDER + newFileName;

            // Rename the file
            fs.rename(originalFilePath, newFilePath, (err) => {
              if (err) {
                console.error("Error renaming file: ", err);
                return res
                  .status(500)
                  .json({ message: "Error renaming file." });
              }
              // Respond with additional details, if needed
              let key = jsonObject.key;
              let secret = jsonObject.secret;
              let endpointEntityId = jsonObject.endpointEntityId;

              res.status(200).json({
                id: jsonObject.id,
                name: name,
                key: key,
                secret: secret,
                endpointEntityId: endpointEntityId,
                functionEntityStartId: jsonObject.functionEntityStartId,
                functionEntityEndId: jsonObject.functionEntityEndId,
                jarPath: process.env.JAR_STAGING_FOLDER + newFileName,
              });

              // Run the batch file to update the JAR.
              const batchFilePath = path.join(
                __dirname,
                "../processor/jar-processor.bat"
              );
              const jarFilePath = path.join(__dirname, "../jars/", newFileName);
              const command =
                batchFilePath +
                " " +
                jarFilePath +
                ' "' +
                name +
                '" ' +
                key +
                " " +
                secret +
                " " +
                endpointEntityId;

              console.log(command);
              exec(command, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error: ${error.message}`);
                  return;
                }
                if (stderr) {
                  console.error(`Stderr: ${stderr}`);
                  return;
                }
                console.log(`Stdout: ${stdout}`);
              });
            });
          } else {
            return res.status(500).json({
              message:
                "errorCode: " +
                jsonObject.errorCode +
                "; errorMessage: " +
                jsonObject.errorMessage,
            });
          }
        } catch (e) {
          res.status(500).json({ message: "Error parsing response." });
        }
      } else {
        res.status(statusCode).json({
          message: responseBody,
        });
      }
    });
  });

  localReq.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
    res.status(500).json({ message: `Request failed: ${e.message}` });
  });

  // Write data to request body
  localReq.write(postData);
  localReq.end();

  // Mongo stuff, might need this
  // const url = req.protocol + "://" + req.get("host");
  // const connector = new Connector({
  //   title: req.body.title,
  //   content: req.body.content,
  //   jarPath: url + "/jars/" + req.file.filename,
  // });
  // connector.save().then((createdConnector) => {
  //   res.status(201).json({
  //     message: "Connector added successfully",
  //     connector: {
  //       /// adds all the properties from the created connector
  //       ...createdConnector,
  //       id: createdConnector._id,
  //     },
  //   });
  // });
};

exports.getConnectors = (req, res, next) => {
  let token = req.query.token;
  let orgId = req.params.orgId;

  const postData = JSON.stringify({
    // token: req.body.token,
  });

  const options = {
    host: process.env.JITTERBIT_HOST,
    path: API_PATH + orgId + "/connector",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // "Content-Length": Buffer.byteLength(postData),
      authToken: token,
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
        try {
          let jsonObject = JSON.parse(responseBody);

          // Assuming `registeredConnectorList` is an array
          let status = jsonObject.status;
          if (status === true) {
            let connectorList = jsonObject.registeredConnectorList;

            if (Array.isArray(connectorList)) {
              const parsedList = connectorList.map((connector) => ({
                id: connector.id,
                name: connector.name,
                key: connector.key,
                secret: connector.secret,
                endpointEntityId: connector.endpointEntityId,
                functionEntityStartId: connector.functionEntityStartId,
                functionEntityEndId: connector.functionEntityEndId,
              }));

              res.status(200).json(parsedList);
            } else {
              res.status(500).json({ message: "Unexpected response format" });
            }
          } else {
            console.error("errorCode: " + jsonObject.errorCode);
            console.error("errorMessage: " + jsonObject.errorMessage);
          }
        } catch (e) {
          res.status(500).json({ message: "Error parsing response." });
        }
      } else {
        res.status(statusCode).json({
          message: responseBody,
        });
      }
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

exports.deleteConnector = (req, res, next) => {
  let token = req.query.token;
  let orgId = req.params.orgId;
  let connectorId = req.params.id;

  const postData = JSON.stringify({
    // token: req.body.token,
  });

  const options = {
    host: process.env.JITTERBIT_HOST,
    path:
      API_PATH +
      orgId +
      "/connector/" +
      connectorId,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      authToken: token,
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
        try {
          let jsonObject = JSON.parse(responseBody);
          let status = jsonObject.status;

          if (status === true) {
            res.status(200).json({
              id: jsonObject.id,
              name: jsonObject.name,
              key: jsonObject.key,
              secret: jsonObject.secret,
              endpointEntityId: jsonObject.endpointEntityId,
              functionEntityStartId: jsonObject.functionEntityStartId,
              functionEntityEndId: jsonObject.functionEntityEndId,
            });
          } else {
            return res.status(500).json({
              message:
                "errorCode: " +
                jsonObject.errorCode +
                "; errorMessage: " +
                jsonObject.errorMessage,
            });
          }
        } catch (e) {
          res.status(500).json({ message: "Error parsing response." });
        }

        // Delete files containing the connectorId in the name
        const jarFolderPath = path.join(__dirname, "../jars/");
        fs.readdir(jarFolderPath, (err, files) => {
          if (err) {
            console.error(`Error reading directory: ${err.message}`);
            return res
              .status(500)
              .json({ message: `Error reading directory: ${err.message}` });
          }

          files.forEach((file) => {
            if (file.includes(connectorId)) {
              fs.unlink(path.join(jarFolderPath, file), (err) => {
                if (err) {
                  console.error(`Error deleting file: ${err.message}`);
                } else {
                  console.log(`Deleted file: ${file}`);
                }
              });
            }
          });
        });
      } else {
        res.status(statusCode).json({
          message: responseBody,
        });
      }
    });
  });

  localReq.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
    res.status(500).json({ message: `Request failed: ${e.message}` });
  });

  // console.log(localReq);
  // Write data to request body
  localReq.write(postData);
  localReq.end();

  // Connector.deleteOne({ _id: req.params.id }).then((result) => {
  //   res.status(200).json({ message: "Connector deleted" });
  // });
};
