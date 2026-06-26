import Link from 'next/link';
import { Button } from '@/components/ui';
import { Calendar, ShieldCheck, Zap, MessageCircle, Clock, CalendarCheck, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-primary-200 selection:text-primary-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-zinc-200/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-sm shadow-primary-200">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">Agenda Fácil</span>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-primary-600">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Acesso Admin
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent -z-10" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-20 -left-40 w-72 h-72 bg-primary-300 rounded-full blur-3xl opacity-30 -z-10" />

          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/80 text-primary-800 text-sm font-medium mb-8 border border-primary-200/50 backdrop-blur-sm shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping absolute opacity-75"></span>
              <span className="relative flex h-2 w-2 rounded-full bg-primary-500"></span>
              Agendamentos abertos para esta semana!
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight text-zinc-900">
              Seu tempo é valioso. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                Agende em segundos.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Escolha o serviço, o profissional e o melhor horário. Tudo rápido, fácil e com confirmação direta no seu WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/agendamento" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-600/20 transition-all hover:scale-105 active:scale-95 group text-lg h-14 px-8 rounded-full">
                  Agendar Agora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {/* Social Proof / Stats */}
            <div className="mt-16 pt-8 border-t border-zinc-200/60 flex flex-col sm:flex-row items-center justify-center gap-8 text-zinc-500 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
<span>Multiplos agendamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                <span>Profissionais qualificados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                <span>Suporte via WhatsApp</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que usar o Agenda Fácil?</h2>
              <p className="text-zinc-500 max-w-2xl mx-auto">Nossa plataforma foi desenhada para eliminar a fricção na hora de marcar um horário.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-yellow-500" />,
                  title: 'Rápido e Intuitivo',
                  description: 'Interface limpa e direta. Em menos de 3 cliques o seu horário já está reservado.'
                },
                {
                  icon: <MessageCircle className="w-6 h-6 text-green-500" />,
                  title: 'Integração WhatsApp',
                  description: 'Receba a confirmação e lembretes diretamente no seu celular, sem precisar de aplicativos extras.'
                },
                {
                  icon: <Clock className="w-6 h-6 text-blue-500" />,
                  title: 'Disponibilidade Real',
                  description: 'Veja apenas os horários realmente livres dos profissionais em tempo real.'
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-zinc-900">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 bg-zinc-900 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona?</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">É tão simples que você não vai acreditar.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Line connector for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 -translate-y-1/2 z-0" />
              
              {[
                { step: '01', title: 'Escolha', desc: 'Selecione o serviço e o profissional desejado.' },
                { step: '02', title: 'Agende', desc: 'Escolha a melhor data e horário para você.' },
                { step: '03', title: 'Confirme', desc: 'Preencha seus dados básicos e WhatsApp.' },
                { step: '04', title: 'Pronto!', desc: 'Receba a notificação e compareça no horário.' }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-primary-500 flex items-center justify-center text-xl font-bold text-primary-400 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-600 -z-10" />
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10" />
          
          <div className="max-w-4xl mx-auto px-4 text-center">
<Smartphone className="w-16 h-16 text-primary-200 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Pronto para facilitar sua vida?</h2>
            <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
              Não perca mais tempo tentando conciliar horários por mensagens demoradas. Faça seu agendamento agora mesmo.
            </p>
            <Link href="/agendamento">
              <Button size="xl" className="bg-primary-500 text-white hover:bg-primary-700 shadow-xl transition-all hover:scale-105 active:scale-95 group text-lg h-14 px-8 rounded-full">
                Fazer meu Agendamento
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 py-12 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-900">
            <CalendarCheck className="w-5 h-5 text-primary-600" />
            <span className="font-bold">Agenda Fácil</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Agenda Fácil. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-zinc-400 hover:text-primary-600 text-sm font-medium transition-colors">
              Painel Administrativo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
