import axios from 'axios';
import { getEvolutionConfig } from '../config/index.js';

export interface WhatsAppMessage {
  number: string;
  text: string;
}

export class WhatsAppService {
  private baseUrl: string;
  private instanceName: string;
  private apiKey: string;

  constructor() {
    const config = getEvolutionConfig();
    this.baseUrl = config.apiUrl;
    this.instanceName = config.instanceName;
    this.apiKey = config.apiKey;
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
    if (digits.length === 10 || digits.length === 11) {
      const ddd = digits.slice(0, 2);
      if (ddd.startsWith('0') || ddd.startsWith('1')) {
        throw new Error(`DDD inválido: ${ddd}`);
      }
return `55${digits}`;
    }
    return phone;
  }
}