import { redirect } from 'next/navigation';

export default function RedundantSimulatorPage() {
  // Esta página foi fundida com /simulations para evitar duplicação.
  redirect('/simulations');
}
