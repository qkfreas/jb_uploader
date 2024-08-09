const express = require("express");
const multer = require("multer");

const router = express.Router();


const ConnectorController = require("../controllers/connectors");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = process.env.MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, process.env.JAR_STAGING_FOLDER);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = process.env.MIME_TYPE_MAP[file.mimetype];
    const newName = name.replaceAll(".jar", "");
    // Add a temporary marker that will be replaced later
    cb(null, newName + ".temp." + ext);
  },
});

router.post(
  "/:orgId",
  // checkAuth,
  multer({ storage: storage }).single("jar"),
  ConnectorController.createConnector
);

router.get("/:orgId", ConnectorController.getConnectors);

router.delete(
  "/:orgId/:id",
  // checkAuth,
  ConnectorController.deleteConnector
);

module.exports = router;
