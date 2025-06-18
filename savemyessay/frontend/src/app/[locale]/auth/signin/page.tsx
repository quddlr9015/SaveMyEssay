"use client";

import { getApiUrl } from "@/utils/api";
import { useLocale, useTranslations } from "next-intl";

export default function SignIn() {
  const t = useTranslations("SignInPage");
  const locale = useLocale();
  const handleGoogleSignIn = async () => {
    window.location.href = `${getApiUrl()}/auth/google/login?state=${locale}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("title")}
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t("googleSignInButton")}
          </button>
        </div>
      </div>
    </div>
  );
} 