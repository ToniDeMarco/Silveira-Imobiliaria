import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { NaoEncontrado } from "@/components/site/nao-encontrado";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NaoEncontrado />
      </main>
      <Footer />
    </>
  );
}
