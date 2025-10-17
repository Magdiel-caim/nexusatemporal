import amqp, { Channel, ConsumeMessage, ChannelModel } from 'amqplib';

interface RabbitMQConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost?: string;
}

export class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private config: RabbitMQConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    try {
      const connectionString = `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}${this.config.vhost || '/'}`;

      console.log('[RabbitMQ] Connecting to RabbitMQ...');
      const conn: ChannelModel = await amqp.connect(connectionString);
      this.connection = conn;
      this.channel = await conn.createChannel();

      this.reconnectAttempts = 0;
      console.log('[RabbitMQ] ✅ Connected to RabbitMQ successfully');

      // Handle connection errors
      conn.on('error', (err: Error) => {
        console.error('[RabbitMQ] Connection error:', err);
        this.handleConnectionError();
      });

      conn.on('close', () => {
        console.warn('[RabbitMQ] Connection closed');
        this.handleConnectionError();
      });

    } catch (error) {
      console.error('[RabbitMQ] Failed to connect:', error);
      this.handleConnectionError();
      throw error;
    }
  }

  /**
   * Handle connection errors and attempt reconnection
   */
  private async handleConnectionError(): Promise<void> {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[RabbitMQ] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect().catch(err =>
          console.error('[RabbitMQ] Reconnection failed:', err)
        );
      }, this.reconnectDelay);
    } else {
      console.error('[RabbitMQ] Max reconnection attempts reached. Please check RabbitMQ server.');
    }
  }

  /**
   * Publish message to queue
   */
  async publishToQueue(queue: string, message: any): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });
      const messageBuffer = Buffer.from(JSON.stringify(message));

      this.channel.sendToQueue(queue, messageBuffer, { persistent: true });
      console.log(`[RabbitMQ] ✅ Message sent to queue: ${queue}`);
    } catch (error) {
      console.error(`[RabbitMQ] Error publishing to queue ${queue}:`, error);
      throw error;
    }
  }

  /**
   * Publish message to exchange
   */
  async publishToExchange(
    exchange: string,
    routingKey: string,
    message: any,
    exchangeType: 'direct' | 'topic' | 'fanout' = 'topic'
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.assertExchange(exchange, exchangeType, { durable: true });
      const messageBuffer = Buffer.from(JSON.stringify(message));

      this.channel.publish(exchange, routingKey, messageBuffer, { persistent: true });
      console.log(`[RabbitMQ] ✅ Message published to exchange: ${exchange}, routingKey: ${routingKey}`);
    } catch (error) {
      console.error(`[RabbitMQ] Error publishing to exchange ${exchange}:`, error);
      throw error;
    }
  }

  /**
   * Consume messages from queue
   */
  async consume(
    queue: string,
    callback: (message: any) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.prefetch(1); // Process one message at a time

      console.log(`[RabbitMQ] 👂 Listening for messages on queue: ${queue}`);

      this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`[RabbitMQ] 📨 Received message from ${queue}:`, content);

            await callback(content);

            // Acknowledge message after successful processing
            this.channel!.ack(msg);
            console.log(`[RabbitMQ] ✅ Message processed successfully`);
          } catch (error) {
            console.error(`[RabbitMQ] Error processing message:`, error);
            // Reject and requeue message
            this.channel!.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      console.error(`[RabbitMQ] Error consuming from queue ${queue}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to exchange with routing key pattern
   */
  async subscribe(
    exchange: string,
    routingKeyPattern: string,
    callback: (message: any) => Promise<void>,
    exchangeType: 'direct' | 'topic' | 'fanout' = 'topic'
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.assertExchange(exchange, exchangeType, { durable: true });

      // Create exclusive queue for this subscriber
      const { queue } = await this.channel.assertQueue('', { exclusive: true });

      // Bind queue to exchange with routing key pattern
      await this.channel.bindQueue(queue, exchange, routingKeyPattern);

      console.log(`[RabbitMQ] 👂 Subscribed to exchange: ${exchange}, pattern: ${routingKeyPattern}`);

      await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`[RabbitMQ] 📨 Received message from exchange ${exchange}:`, content);

            await callback(content);

            this.channel!.ack(msg);
          } catch (error) {
            console.error(`[RabbitMQ] Error processing message:`, error);
            this.channel!.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      console.error(`[RabbitMQ] Error subscribing to exchange ${exchange}:`, error);
      throw error;
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('[RabbitMQ] Connection closed gracefully');
    } catch (error) {
      console.error('[RabbitMQ] Error closing connection:', error);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// Singleton instance
let rabbitMQInstance: RabbitMQService | null = null;

export function getRabbitMQService(): RabbitMQService {
  if (!rabbitMQInstance) {
    const config: RabbitMQConfig = {
      host: process.env.RABBITMQ_HOST || 'rabbitmq.nexusatemporal.com.br',
      port: parseInt(process.env.RABBITMQ_PORT || '5672'),
      username: process.env.RABBITMQ_USER || 'nexus_mq',
      password: process.env.RABBITMQ_PASSWORD || 'ZSGbN3hQJnl3Rnq6TE1wsFVQCi47EJgR',
      vhost: process.env.RABBITMQ_VHOST || '/'
    };

    rabbitMQInstance = new RabbitMQService(config);
  }

  return rabbitMQInstance;
}
