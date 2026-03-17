// creating queue 
import amqp from "amqplib";

export default async function sendToQueue(data) {
    console.log("rabbitmq running")
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "emailQueue";

  // Ensure the queue exists before sending messages and create it if it doesn't
  await channel.assertQueue(queue, { durable: true });

  // Send message to the queue with persistence
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });

  console.log("Message sent:", data);

  setTimeout(() => {
    connection.close();
  }, 500);
}
