import { redirect } from 'next/navigation';

// Rota legada — redirecionada para /relatorio
export default function ReportLegacyRedirect(): never {
  redirect('/relatorio');
}
