import amqp from "amqplib";
import nodemailer from "nodemailer";

async function startWorker() {
    console.log("worker running")
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "emailQueue";

  // Ensure the queue exists before consuming and create it if it doesn't
  await channel.assertQueue(queue, { durable: true });

  console.log("Worker is waiting for messages...");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rohan.raj@tothenew.com",
      pass: "gepc wgkw yvoe jzbe",
    },
  });

  // Consume messages from the queue
  channel.consume(queue, async (msg) => {
    const data = JSON.parse(msg.content.toString());

    try {
      await transporter.sendMail({
        from: "rohan.raj@tothenew.com",
        to: data?.email,
        subject: data?.subject,
        text: data?.text,
      });

      console.log("Email sent to:", data?.email);

      channel.ack(msg); 
    } catch (err) {
      console.error("Error sending email:", err);
    }
  });
}

startWorker();