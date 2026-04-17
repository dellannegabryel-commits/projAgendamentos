import Link from 'next/link';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Sistema de Agendamento
        </h1>
        <p className="text-zinc-600 mb-8">
          Escolha uma opção para continuar
        </p>

        <div className="space-y-3">
          <Link href="/agendamento" className="block">
            <Button className="w-full">
              Agendar Serviço
            </Button>
          </Link>
          
          <Link href="/admin" className="block">
            <Button variant="outline" className="w-full">
              Área Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}