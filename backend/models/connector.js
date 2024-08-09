const mongoose = require("mongoose");

const connectorSchema = mongoose.Schema({

    id:  { type: String},
    name: { type: String, required: true },
    key: { type: String },
    secret: { type: String },
    endpointEntityId: { type: String },
    functionEntityStartId: { type: String },
    functionEntityEndId: { type: String },
});

module.exports = mongoose.model("Connector", connectorSchema);