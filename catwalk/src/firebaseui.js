import * as firebaseui from "firebaseui";
import { auth } from "./firebase";
import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";

export const ui =
  firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

export const uiConfig = {
    signInOptions: [
      {
        provider: EmailAuthProvider.PROVIDER_ID,
        requireDisplayName: false,
      },
      {
        provider: GoogleAuthProvider.PROVIDER_ID,
      },
    ],
    signInFlow: "popup",
    callbacks: {
      signInSuccessWithAuthResult: async (authResult) => {
        const token = await authResult.user.getIdToken();
        localStorage.setItem("token", token);
        window.location.href = "/";
        return false;
      },
    },
};