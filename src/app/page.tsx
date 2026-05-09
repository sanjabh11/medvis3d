import { Header, Footer } from '@/components/layout';
import { HeroSection } from './sections/HeroSection';
import { ConsultWorkspace } from './sections/ConsultWorkspace';
import { Providers } from './providers';

export default function Home() {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-[--color-medical-surface]">
        <Header />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
            <HeroSection />
            <ConsultWorkspace />
          </div>
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
