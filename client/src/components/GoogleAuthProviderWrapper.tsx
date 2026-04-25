import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode } from "react";

// NOTE: Replace this with your actual Google Client ID from Google Cloud Console
// You should ideally put this in your .env file as VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "520321419219-695m80ab2j6q9e8qkfnjv82892faaiat.apps.googleusercontent.com";

export function GoogleAuthProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
}
