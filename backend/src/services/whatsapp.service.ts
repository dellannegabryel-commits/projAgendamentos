import axios from 'axios';

export interface WhatsAppMessage {
  number: string;
  text: string;
}

export class WhatsAppService {
  private baseUrl: string;
  private instanceName: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.WHATSAPP_API_URL || 'http://localhost:8080';
    this.instanceName = process.env.WHATSAPP_INSTANCE_NAME || 'main';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
  }

  async sendText(message: WhatsAppMessage): Promise<void> {
    const phone = this.formatPhone(message.number);
    
    await axios.post(
      `${this.baseUrl}/message/sendText/${this.instanceName}`,
      { number: phone, text: message.text },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        }
      }
    );
  }

  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `55${digits}@s.whatsapp.net`;
    if (digits.length === 11) return `55${digits}@s.whatsapp.net`;
    return phone;
  }
}