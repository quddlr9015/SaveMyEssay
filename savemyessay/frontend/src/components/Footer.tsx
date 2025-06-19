import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("HomePage");
  return (
    <footer className="bg-gradient-to-r from-indigo-100 to-pink-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-2">
            <Link
              href="/contact"
              className="text-indigo-600 hover:underline font-medium"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-base text-gray-500">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
