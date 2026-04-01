import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface BkashToken {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

@Injectable()
export class BkashProvider {
  private readonly logger = new Logger(BkashProvider.name);
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;
  private token: BkashToken | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    this.baseUrl = configService.get('payment.bkash.baseUrl')!;
    this.http = axios.create({ baseURL: this.baseUrl });
  }

  private async getToken(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token.id_token;
    }

    const response = await this.http.post(
      '/tokenized/checkout/token/grant',
      {
        app_key: this.configService.get('payment.bkash.appKey'),
        app_secret: this.configService.get('payment.bkash.appSecret'),
      },
      {
        headers: {
          username: this.configService.get('payment.bkash.username'),
          password: this.configService.get('payment.bkash.password'),
        },
      },
    );

    this.token = response.data;
    this.tokenExpiry = new Date(Date.now() + (this.token!.expires_in - 60) * 1000);
    return this.token!.id_token;
  }

  async createPayment(params: {
    amount: number;
    currency: string;
    merchantInvoiceNumber: string;
    callbackURL: string;
    intent?: string;
  }) {
    const token = await this.getToken();
    const response = await this.http.post(
      '/tokenized/checkout/create',
      {
        mode: '0011',
        payerReference: params.merchantInvoiceNumber,
        callbackURL: params.callbackURL,
        amount: String(params.amount),
        currency: params.currency || 'BDT',
        intent: params.intent || 'sale',
        merchantInvoiceNumber: params.merchantInvoiceNumber,
      },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': this.configService.get('payment.bkash.appKey'),
        },
      },
    );
    return response.data;
  }

  async executePayment(paymentID: string) {
    const token = await this.getToken();
    const response = await this.http.post(
      '/tokenized/checkout/execute',
      { paymentID },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': this.configService.get('payment.bkash.appKey'),
        },
      },
    );
    return response.data;
  }

  async queryPayment(paymentID: string) {
    const token = await this.getToken();
    const response = await this.http.post(
      '/tokenized/checkout/payment/status',
      { paymentID },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': this.configService.get('payment.bkash.appKey'),
        },
      },
    );
    return response.data;
  }

  async refundPayment(params: {
    paymentID: string;
    amount: number;
    trxID: string;
    sku: string;
    reason: string;
  }) {
    const token = await this.getToken();
    const response = await this.http.post(
      '/tokenized/checkout/payment/refund',
      params,
      {
        headers: {
          Authorization: token,
          'X-APP-Key': this.configService.get('payment.bkash.appKey'),
        },
      },
    );
    return response.data;
  }
}
