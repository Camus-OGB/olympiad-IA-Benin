// Redirect /candidat to /candidat/dashboard
import { redirect } from 'next/navigation';

export default function CandidatePage() {
  redirect('/candidat/dashboard');
}
