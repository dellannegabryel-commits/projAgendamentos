import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppService } from '../services/whatsapp.service.js';
import axios from 'axios';

vi.mock('axios');
vi.mock('../config/index.js', () => ({
  getEvolutionConfig: () => ({
    apiUrl: 'http://localhost:8080',
    instanceName: 'test-instance',
    apiKey: 'test-api-key',
  }),
}));

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  const mockedAxios = vi.mocked(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WhatsAppService();
  });

  describe('formatPhone', () => {
    it('deve formatar telefone com 11 digitos (celular)', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      
      await service.sendText({ number: '11999999999', text: 'Teste' });
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/message/sendText/test-instance',
        expect.objectContaining({ number: '5511999999999' }),
        expect.any(Object)
      );
    });

    it('deve formatar telefone com 10 digitos (fixo)', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      
      await service.sendText({ number: '1133334444', text: 'Teste' });
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/message/sendText/test-instance',
        expect.objectContaining({ number: '551133334444' }),
        expect.any(Object)
      );
    });

    it('deve rejeitar DDD comecando com 0', async () => {
      await expect(
        service.sendText({ number: '01999999999', text: 'Teste' })
      ).rejects.toThrow('DDD inválido');
    });

    it('deve aceitar DDD comecando com 1 (ex: 11 = São Paulo)', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      
      await service.sendText({ number: '11999999999', text: 'Teste' });
      
      expect(mockedAxios.post).toHaveBeenCalledOnce();
    });

    it('deve aceitar DDD valido (2-9)', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      
      await service.sendText({ number: '21999999999', text: 'Teste' });
      
      expect(mockedAxios.post).toHaveBeenCalledOnce();
    });

    it('deve manter formato se telefone ja tiver codigo do pais', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      
      await service.sendText({ number: '5511999999999', text: 'Teste' });
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/message/sendText/test-instance',
        expect.objectContaining({ number: '5511999999999' }),
        expect.any(Object)
      );
    });
  });

  describe('sendText', () => {
    it('deve enviar mensagem com headers corretos', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });
      
      await service.sendText({ number: '11999999999', text: 'Olá' });
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'apikey': 'test-api-key',
          }),
        })
      );
    });

    it('deve lançar erro quando Evolution API retornar erro', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
      
      await expect(
        service.sendText({ number: '11999999999', text: 'Teste' })
      ).rejects.toThrow('Network Error');
    });

    it('deve lançar erro quando API retornar status 401', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });
      
      await expect(
        service.sendText({ number: '11999999999', text: 'Teste' })
      ).rejects.toThrow();
    });
  });
});
