import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('mail.host'),
      port: configService.get('mail.port'),
      auth: {
        user: configService.get('mail.user') || undefined,
        pass: configService.get('mail.pass') || undefined,
      },
    });
  }

  async sendMail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      await this.transporter.sendMail({
        from: `"${this.configService.get('mail.fromName')}" <${this.configService.get('mail.from')}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      this.logger.error('Failed to send email', error);
    }
  }

  async sendWelcome(to: string, name: string) {
    await this.sendMail({
      to,
      subject: 'Welcome to SaaS Commerce!',
      html: `<h1>Welcome, ${name}!</h1><p>Your account has been created successfully.</p>`,
    });
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    await this.sendMail({
      to,
      subject: 'Reset your password',
      html: `<p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 1 hour.</p>`,
    });
  }

  async sendOrderConfirmation(to: string, orderNumber: string, total: number) {
    await this.sendMail({
      to,
      subject: `Order Confirmed: #${orderNumber}`,
      html: `<h2>Order Confirmed!</h2><p>Your order <strong>#${orderNumber}</strong> has been confirmed.</p><p>Total: ${total} BDT</p>`,
    });
  }

  async sendOrderShipped(to: string, orderNumber: string, trackingNumber?: string) {
    await this.sendMail({
      to,
      subject: `Your order #${orderNumber} has been shipped`,
      html: `<h2>Order Shipped!</h2><p>Your order <strong>#${orderNumber}</strong> is on its way.</p>${trackingNumber ? `<p>Tracking: ${trackingNumber}</p>` : ''}`,
    });
  }
}
