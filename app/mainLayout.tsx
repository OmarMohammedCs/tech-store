import NavbarCompoent from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "react-hot-toast";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <NavbarCompoent />

<Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: {
                    background: "#363636",
                    color: "#fff",
                },
            }} />

            <main className="container mx-auto max-w-7xl py-8 px-6 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    )
}
