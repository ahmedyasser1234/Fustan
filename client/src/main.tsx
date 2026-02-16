import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { LanguageProvider } from "@/lib/i18n";
import { GoogleAuthProviderWrapper } from "@/components/GoogleAuthProviderWrapper";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <GoogleAuthProviderWrapper>
          <App />
        </GoogleAuthProviderWrapper>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);
