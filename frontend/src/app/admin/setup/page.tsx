'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { api } from '@/lib/api';

const setupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirmação é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type SetupForm = z.infer<typeof setupSchema>;

export default function AdminSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
  });

  async function onSubmit(data: SetupForm) {
    setIsLoading(true);
    try {
      const response = await api.auth.setup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      const { token, admin } = response;

      localStorage.setItem('@agendafacil:token', token);
      localStorage.setItem('@agendafacil:user', JSON.stringify(admin));
      document.cookie = `agendafacil_token=${token}; path=/; max-age=86400; SameSite=Lax`;

      toast.success('Conta de administrador criada com sucesso!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Configuração Inicial
          </h1>
          <p className="text-sm text-zinc-500">
            Crie a conta de administrador do Agenda Fácil
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          Esta tela só aparece na primeira inicialização. Após criar a conta, ela não ficará mais disponível.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            type="text"
            label="Nome completo"
            placeholder="Seu nome"
            error={errors.name?.message}
            icon={<User className="h-5 w-5" />}
            {...register('name')}
          />

          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="admin@exemplo.com"
            error={errors.email?.message}
            icon={<Mail className="h-5 w-5" />}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            icon={<Lock className="h-5 w-5" />}
            {...register('password')}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirmar senha"
            placeholder="Digite a senha novamente"
            error={errors.confirmPassword?.message}
            icon={<Lock className="h-5 w-5" />}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full h-12 mt-2"
            size="lg"
          >
            {isLoading ? 'Criando conta...' : 'Criar conta de administrador'}
          </Button>
        </form>
      </div>
    </div>
  );
}
