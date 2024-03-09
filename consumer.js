var amqp = require("amqplib/callback_api");
var fs = require('fs');
require('dotenv').config();

console.log("Consumer");
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

// Setting up an AMQP listener
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

        channel.assertExchange(exchangeName, exchangeType, { durable: false });

        channel.assertQueue('', { exclusive: true }, function(err2, q) {
            if (err2) {
                console.error("Error asserting queue:", err2);
                return;
            }

            // Binding to a queue
            channel.bindQueue(q.queue, exchangeName, topicKey);

            console.log('--- Waiting for messages. Press CTRL+C to exit.');

            channel.consume(q.queue, function(msg) {
                // Printing the message content
                console.log("Received:", msg.content.toString());
            }, { noAck: true });
        });
    });

    // Close the connection when the script exits
    process.on('SIGINT', function () {
        console.log("Closing AMQP connection...");
        conn.close(function () {
            console.log("AMQP connection closed.");
            process.exit();
        });
    });
});
