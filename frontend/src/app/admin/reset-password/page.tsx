'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { api } from '@/lib/api';

const resetSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirmação é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error('Token de recuperação ausente ou inválido');
    }
  }, [token]);

  async function onSubmit(data: ResetForm) {
    if (!token) return;
    setIsLoading(true);
    try {
      await api.auth.resetPassword({ token, password: data.password });
      setSuccess(true);
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Link inválido
          </h1>
          <p className="text-sm text-zinc-500">
            O link de recuperação é inválido ou expirou. Solicite um novo.
          </p>
        </div>
        <Link
          href="/admin/forgot-password"
          className="block text-center text-sm text-primary-600 hover:text-primary-700"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Senha redefinida!
          </h1>
          <p className="text-sm text-zinc-500">
            Você será redirecionado para a tela de login em instantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="h-7 w-7 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Redefinir senha
        </h1>
        <p className="text-sm text-zinc-500">
          Digite sua nova senha abaixo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="password"
          type="password"
          label="Nova senha"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          icon={<Lock className="h-5 w-5" />}
          {...register('password')}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirmar nova senha"
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
          {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 p-4">
      <Suspense fallback={
        <div className="text-zinc-500">Carregando...</div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
