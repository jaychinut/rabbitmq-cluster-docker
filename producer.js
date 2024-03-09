var amqp = require("amqplib/callback_api");
var fs = require('fs');
require('dotenv').config();

console.log("Producer");
console.log("Setting up AMQP connection...");

const CA_FILE = process.env.CA_FILE;
const AMQP_STRING = process.env.AMQP_STRING;

if (!CA_FILE) {
    console.error("CA_FILE is not defined in the environment variables.");
    process.exit(1);
}

var amqpOpts = {
    // because we are using a self-signed certificate, we will get an error if we don't provide the CA_FILE
    ca: [fs.readFileSync(CA_FILE)],
    // key: [fs.readFileSync(KEY_FILE)],
    // cert: [fs.readFileSync(CERT_FILE)],
    secureProtocol: 'TLSv1_2_method' // Specify the TLS version
};

// Setting up an AMQP connection
amqp.connect(AMQP_STRING, amqpOpts, function(err0, conn) {
    if (err0) {
        console.error("Error connecting to RabbitMQ:", err0);
        return;
    }

    // Topics:
    // https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html

    console.log("Creating AMQP channel...");

    conn.createChannel(function(err1, channel) {
        if (err1) {
            console.error("Error creating channel:", err1);
            return;
        }

        var exchangeName = 'testuser';
        var exchangeType = "topic";
        var topicKey = "testuser.topic1";
        var msg = new Date().toISOString();

        channel.assertExchange(exchangeName, exchangeType, { durable: false });

        channel.publish(exchangeName, topicKey, Buffer.from(msg));
        console.log("--- Sent to %s: '%s'", topicKey, msg);

        // Close the connection when the script finishes publishing the message
        setTimeout(function () {
            console.log("Closing AMQP connection...");
            conn.close(function () {
                console.log("AMQP connection closed.");
                process.exit();
            });
        }, 500); // Adjust the timeout as needed
    });
});
