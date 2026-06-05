'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { api } from '@/lib/api';

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotForm) {
    setIsLoading(true);
    try {
      await api.auth.forgotPassword(data);
      setSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            {sent ? (
              <CheckCircle2 className="h-7 w-7 text-primary-600" />
            ) : (
              <KeyRound className="h-7 w-7 text-primary-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {sent ? 'Solicitação enviada' : 'Recuperar senha'}
          </h1>
          <p className="text-sm text-zinc-500">
            {sent
              ? 'Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinir sua senha.'
              : 'Informe o e-mail cadastrado para receber as instruções de recuperação.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="admin@exemplo.com"
              error={errors.email?.message}
              icon={<Mail className="h-5 w-5" />}
              {...register('email')}
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full h-12 mt-2"
              size="lg"
            >
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
          </form>
        ) : (
          <div className="bg-zinc-50 rounded-xl p-4 text-sm text-zinc-600 text-center">
            Verifique sua caixa de entrada e siga as instruções enviadas.
          </div>
        )}

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
    </div>
  );
}
