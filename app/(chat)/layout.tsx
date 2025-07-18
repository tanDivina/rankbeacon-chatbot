import { auth, signOut } from '@/lib/auth';
import { Providers } from '@/components/providers';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';

const geist = GeistSans;
const geistMono = GeistMono;

const LIGHT_THEME_COLOR = '#ffffff';
const DARK_THEME_COLOR = '#0a0a0a';

const THEME_COLOR_SCRIPT = `
(function() {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = document.documentElement.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-900">
            <h1 className="text-xl font-bold">RankBeacon</h1>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <p className="text-sm">Logged in as: {session.user?.email}</p>
                  <form
                    action={async () => {
                      'use server';
                      await signOut({ redirectTo: '/login' });
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <p className="text-sm">Not logged in</p>
              )}
            </div>
          </header>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}