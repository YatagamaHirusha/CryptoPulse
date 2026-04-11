import { ThemeProvider } from '../../../components/ThemeProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <div className="dark min-h-screen bg-black">
        {children}
      </div>
    </ThemeProvider>
  );
}
