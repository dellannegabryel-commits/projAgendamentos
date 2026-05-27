'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { api } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const response = await api.auth.login(data);
      const { token, admin } = response;

      localStorage.setItem('@agendafacil:token', token);
      localStorage.setItem('@agendafacil:user', JSON.stringify(admin));
      document.cookie = `agendafacil_token=${token}; path=/; max-age=86400`;

      toast.success('Login realizado com sucesso!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Agenda Fácil
          </h1>
          <p className="text-sm text-zinc-500">
            Acesse o painel administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="admin@agendafacil.com"
            error={errors.email?.message}
            icon={<Mail className="h-5 w-5" />}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={<Lock className="h-5 w-5" />}
            {...register('password')}
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full h-12 mt-2"
            size="lg"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
