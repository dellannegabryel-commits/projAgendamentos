'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Agendamentos', href: '/admin' },
    { name: 'Categorias', href: '/admin/categorias' },
    { name: 'Profissionais', href: '/admin/profissionais' },
    { name: 'Horários', href: '/admin/horarios' },
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
        <div className="p-4 border-t border-zinc-800">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Voltar ao site
          </Link>
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
