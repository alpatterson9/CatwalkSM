import { useEffect } from "react";
import { ui, uiConfig } from "../firebaseui";


export default function AccountLoginPage() {
  useEffect(() => {
    ui.start("#firebaseui-auth-container", uiConfig);
    return () => ui.reset();
  }, []);

  return <div id="firebaseui-auth-container" />;
}