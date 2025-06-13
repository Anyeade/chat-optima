import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the landing page as the homepage
  redirect('/landing');
}
