"use client";

import React from "react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const sections = [
    {
      title: "1. ACCEPTANCE",
      content: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      title: "2. USE OF SITE",
      content: "You may use our site only for lawful purposes. You may not use our site in any way that breaches any applicable local, national, or international law or regulation."
    },
    {
      title: "3. ORDERS & PAYMENTS",
      content: "All orders are subject to availability and confirmation of the order price. Dispatch times may vary according to availability and any guarantees or representations made as to delivery times are subject to any delays resulting from postal delays or force majeure."
    },
    {
      title: "4. SHIPPING",
      content: "We deliver across India. Shipping times are estimates and not guarantees. We are not liable for any delays caused by the shipping carrier."
    },
    {
      title: "5. RETURNS",
      content: "Our return policy allows you to return items within 7 days of delivery. Items must be unworn, unwashed, and have original tags attached."
    },
    {
      title: "6. INTELLECTUAL PROPERTY",
      content: "The intellectual property rights in all software and content made available to you on or through this website remains the property of MENACE and are protected by copyright laws and treaties around the world."
    },
    {
      title: "7. LIMITATION OF LIABILITY",
      content: "We shall not be liable for any indirect, special, incidental, or consequential damages arising out of the use or inability to use our products or this site."
    },
    {
      title: "8. CONTACT",
      content: "For any questions regarding these Terms of Service, please contact us at legal@menace.in."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-anton text-5xl md:text-8xl uppercase tracking-wider mb-16 text-center"
        >
          TERMS OF SERVICE
        </motion.h1>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border-t border-[#8A8A8A]/30 pt-8"
            >
              <h2 className="font-anton text-2xl tracking-wide mb-4 text-[#C6FF00]">{section.title}</h2>
              <p className="font-inter text-[#8A8A8A] leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
