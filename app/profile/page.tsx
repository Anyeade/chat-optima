import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  // Redirect guest users to chat since they don't have profiles
  if (session.user?.type === 'guest') {
    redirect('/chat');
  }

  return (
    <div className="min-h-screen bg-githubDark font-poppins text-white overflow-hidden">
      {/* Particles Background */}
      <HeroParticles />
      
      {/* Header/Navigation */}
      <AuthAwareNavbar />
      
      {/* Scroll to top button */}
      <ScrollToTopButton />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] p-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] mb-6">
            Profile Settings
          </h1>
          
          <div className="space-y-6">
            {/* User Info Section */}
            <div className="bg-[#0f0f10] rounded-lg p-4 border border-[#2f343c]">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={session.user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-[#1a1a1b] border border-[#2f343c] rounded-lg text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={session.user?.type || 'user'}
                    disabled
                    className="w-full px-3 py-2 bg-[#1a1a1b] border border-[#2f343c] rounded-lg text-white disabled:opacity-60 capitalize"
                  />
                </div>
              </div>
            </div>

            {/* Chat Settings */}
            <div className="bg-[#0f0f10] rounded-lg p-4 border border-[#2f343c]">
              <h2 className="text-xl font-semibold mb-4">Chat Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Default Chat Visibility</h3>
                    <p className="text-xs text-gray-400">Choose default visibility for new chats</p>
                  </div>
                  <select className="bg-[#1a1a1b] border border-[#2f343c] rounded-lg px-3 py-2 text-white">
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Auto-save Conversations</h3>
                    <p className="text-xs text-gray-400">Automatically save chat history</p>
                  </div>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="w-5 h-5 text-[#58a6ff] bg-[#1a1a1b] border-[#2f343c] rounded focus:ring-[#58a6ff]"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-950/20 rounded-lg p-4 border border-red-800/30">
              <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Delete All Chats</h3>
                    <p className="text-xs text-gray-400">This will permanently delete all your chat history</p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Delete All
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Delete Account</h3>
                    <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Chat */}
          <div className="mt-8">
            <a
              href="/chat"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
