import React from "react";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import Layout from "@layout/Layout";

const WHATSAPP_NUMBER = "919731308713";

const ContactUs = () => {
  return (
    <Layout title="Contact Us" description="This is contact us page">
      <div className="bg-black text-white">
        <div className="max-w-screen-2xl mx-auto py-16 px-4 sm:px-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-4">
              Contact Us
            </h1>
            <p className="text-neutral-400 text-sm max-w-lg mx-auto">
              Reach us on WhatsApp for sizing help, orders, or any questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="border border-neutral-900 bg-[#0A0A0A] p-10 rounded-2xl text-center">
              <span className="flex justify-center text-4xl text-[#D4AF37] mb-4">
                <FaWhatsapp />
              </span>
              <h5 className="text-xl mb-2 font-black uppercase tracking-wide">WhatsApp Us</h5>
              <p className="mb-4 text-sm text-neutral-400 leading-7">
                Chat with us directly for quick support.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-[#128C7E] transition-colors"
              >
                9731308713
              </a>
            </div>

            <div className="border border-neutral-900 bg-[#0A0A0A] p-10 rounded-2xl text-center">
              <span className="flex justify-center text-4xl text-[#D4AF37] mb-4">
                <FiMail />
              </span>
              <h5 className="text-xl mb-2 font-black uppercase tracking-wide">Email Us</h5>
              <p className="mb-0 text-sm text-neutral-400 leading-7">
                <a
                  href="mailto:workwithrasa@gmail.com"
                  className="text-[#D4AF37] hover:underline"
                >
                  workwithrasa@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;
