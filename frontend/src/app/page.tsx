import Link from 'next/link';
import { Button } from '@/components/ui';
import { Calendar, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white">
      <div className="max-w-lg mx-auto px-4 py-20 md:py-32">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-primary-200">
            <Calendar className="w-8 h-8 text-primary-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight mb-3">
            Agenda Fácil
          </h1>
          <p className="text-zinc-500 md:text-lg max-w-sm mx-auto mb-10">
            Agende seus serviços de forma rápida e prática, sem complicação
          </p>

          <div className="space-y-3 max-w-xs mx-auto">
            <Link href="/agendamento" className="block">
              <Button size="xl" className="w-full shadow-sm shadow-primary-200">
                <Calendar className="h-5 w-5" />
                Agendar Serviço
              </Button>
            </Link>

            <Link href="/admin" className="block">
              <Button variant="outline" size="lg" className="w-full">
                <ShieldCheck className="h-5 w-5" />
                Área do Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
