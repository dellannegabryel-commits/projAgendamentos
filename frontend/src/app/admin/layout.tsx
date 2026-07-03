'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('@agendafacil:token');
    localStorage.removeItem('@agendafacil:user');
    document.cookie = 'agendafacil_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-zinc-50">{children}</div>;
  }

  const navigation = [
    { name: 'Agendamentos', href: '/admin' },
    { name: 'Categorias', href: '/admin/categorias' },
    { name: 'Profissionais', href: '/admin/profissionais' },
    { name: 'Horários', href: '/admin/horarios' },
    { name: 'Bloqueios', href: '/admin/bloqueios' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white min-h-screen flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight text-white">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800 space-y-4">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors block">
            ← Voltar ao site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-zinc-900 text-white p-4 flex items-center justify-between">
          <h2 className="font-bold">Admin Panel</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 text-sm no-scrollbar">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full ${
                  pathname === item.href ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
