import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';
import 'katex/dist/katex.min.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat-optima.vercel.app'),
  title: 'Optima AI Chat by HansTech',
  description: 'Optima AI Chat by HansTech: An advanced AI assistant capable of code generation, debugging, architectural planning, and answering technical questions.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Disable pinch zooming
  viewportFit: 'cover',
};

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

const MOBILE_TOUCH_FIX_SCRIPT = `\
(function() {
  document.addEventListener('touchmove', function(e) {
    // Check if we're at the edge of scrolling area
    var target = e.target;
    var scrollTop = target.scrollTop;
    var scrollHeight = target.scrollHeight;
    var height = target.clientHeight;
    var scrollLeft = target.scrollLeft;
    var scrollWidth = target.scrollWidth;
    var width = target.clientWidth;
    var atTopEdge = (scrollTop <= 0);
    var atBottomEdge = (scrollTop + height >= scrollHeight);
    var atLeftEdge = (scrollLeft <= 0);
    var atRightEdge = (scrollLeft + width >= scrollWidth);

    if ((atTopEdge && e.touches[0].screenY > 0) || 
        (atBottomEdge && e.touches[0].screenY < 0) || 
        (atLeftEdge && e.touches[0].screenX > 0) || 
        (atRightEdge && e.touches[0].screenX < 0)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent iOS Safari elastic scrolling/bouncing when user scrolls past the top/bottom
  document.body.style.overscrollBehavior = 'none';
  document.documentElement.style.overscrollBehavior = 'none';
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: MOBILE_TOUCH_FIX_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
