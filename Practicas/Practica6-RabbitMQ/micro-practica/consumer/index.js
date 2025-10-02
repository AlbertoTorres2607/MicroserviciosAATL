require("dotenv").config();
const amqp = require("amqplib");
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE = process.env.QUEUE_NAME || "email_queue";
async function simulateEmailSending(user) {
  // Aquí simulas la lógica de envío de correo.
  console.log(`Simulando envío de correo a: ${user.email} (nombre:
${user.name})`);
  // Simula latencia de envío
  await new Promise((r) => setTimeout(r, 1500));
  console.log(`Correo "enviado" a ${user.email} (simulado)`);
}
async function startConsumer() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    // Recomiendo prefetch(1) para distribuir carga entre consumidores
    channel.prefetch(1);
    console.log("Esperando mensajes en la cola:", QUEUE);
    channel.consume(
      QUEUE,
      async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log("Mensaje recibido:", content);
            if (content.type === "NEW_USER" && content.user) {
              await simulateEmailSending(content.user);
              // ack (confirmamos que procesamos bien)
              channel.ack(msg);
            } else {
              console.log(" Mensaje con tipo desconocido, ack y descartar");
              channel.ack(msg);
            }
          } catch (err) {
            console.error(" Error procesando mensaje:", err);
            // si ocurre error se puede requeue o enviar a DLX; aquí requeue=false para no
            bloquear;
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error(" Error en consumer", err);
    process.exit(1);
  }
}
startConsumer();
