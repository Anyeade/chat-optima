import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the chat page for new conversations
  redirect('/chat');
}
