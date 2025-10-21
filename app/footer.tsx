import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="w-full bg-[#111418] text-white">
      {/* Top info band */}
      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Logo block */}
          <div className="md:col-span-3">
            <div className="inline-block bg-[#081A34] border border-white/10 rounded-md px-5 py-6">
              <div className="text-3xl font-extrabold leading-tight tracking-wide">LAS</div>
              <div className="text-3xl font-extrabold leading-tight tracking-wide">ÁNIMAS</div>
              <div className="inline-block mt-2 bg-[#0F6CA5] text-white px-3 py-1 rounded-sm -rotate-2 text-sm">
                contigo
              </div>
            </div>
          </div>

          {/* Contact and Social */}
          <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact */}
            <div>
              <h3 className="text-white/90 uppercase tracking-wider text-sm mb-4">Contacto</h3>
              <ul className="space-y-3 text-white">
                <li className="text-base">+56 9 5995 0119</li>
                <li className="text-base">camaracomercio@lasanimas.com</li>
                <li className="text-base">Bombero Classing 109</li>
              </ul>
            </div>

            {/* Divider on md up */}
            <div className="hidden md:block md:border-l md:border-white/20" aria-hidden="true" />

            {/* Social */}
            <div className="md:col-span-1">
              <h3 className="text-white/90 uppercase tracking-wider text-sm mb-4">Síguenos</h3>
              <div className="flex items-center gap-4">
                <Link href="#" aria-label="Facebook" className="hover:text-white/80 transition-colors">
                  <FaFacebookF className="h-6 w-6" />
                </Link>
                <Link href="#" aria-label="Instagram" className="hover:text-white/80 transition-colors">
                  <FaInstagram className="h-6 w-6" />
                </Link>
                <Link href="#" aria-label="X" className="hover:text-white/80 transition-colors">
                  <FaXTwitter className="h-6 w-6" />
                </Link>
                <Link href="#" aria-label="YouTube" className="hover:text-white/80 transition-colors">
                  <FaYoutube className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="w-full bg-[#0A2541]">
        <div className="max-w-full">
          <iframe
            title="Mapa - Las Ánimas, Valdivia"
            src="https://www.google.com/maps?q=Las%20%C3%81nimas%2C%20Valdivia%2C%20Chile&output=embed"
            className="w-full h-56 md:h-64 lg:h-72"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#111418]">
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-6 lg:px-8 py-4">
          <p className="text-center text-white/70 text-sm italic">
            © Cámara de comercio Las Ánimas 2025
          </p>
        </div>
      </div>
    </footer>
  );
}

