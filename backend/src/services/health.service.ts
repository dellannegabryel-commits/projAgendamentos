import { prisma } from '../repositories/index.js';
import { getEvolutionConfig } from '../config/index.js';
import axios from 'axios';

let startTime = Date.now();

export function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

export async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function checkEvolution(): Promise<boolean> {
  try {
    const config = getEvolutionConfig();
    await axios.get(`${config.apiUrl}/manager/health`, {
      headers: { 'apikey': config.apiKey },
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}
