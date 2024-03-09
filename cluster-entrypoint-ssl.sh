#!/bin/bash
# set -e
# Copy custom RabbitMQ configuration
cp /etc/rabbitmq/certs/rabbitmq.conf /etc/rabbitmq/
# Set the RabbitMQ node name
NODE_NAME="rabbit@$(hostname)"

# Set the RabbitMQ join cluster host
JOIN_CLUSTER_HOST="$1"

# Set the RabbitMQ node name explicitly
export RABBITMQ_NODENAME="$NODE_NAME"

# Check if JOIN_CLUSTER_HOST is set
if [ -n "$JOIN_CLUSTER_HOST" ]; then
    # Stop RabbitMQ application
    echo "Stopping RabbitMQ application on node $NODE_NAME ..."
    rabbitmqctl stop_app

    # Rest of your script after the 20-second wait
    echo "Continue with the script."
    # Join the RabbitMQ cluster
    echo "Clustering node $NODE_NAME with rabbit@$JOIN_CLUSTER_HOST ..."
    rabbitmqctl join_cluster rabbit@$JOIN_CLUSTER_HOST

    # Start RabbitMQ application
    echo "Starting node $NODE_NAME ..."
    rabbitmqctl start_app

    echo "Done."
else
    echo "JOIN_CLUSTER_HOST is not set. Proceeding without joining a cluster."
fi

# Run RabbitMQ server in the foreground
exec rabbitmq-server
