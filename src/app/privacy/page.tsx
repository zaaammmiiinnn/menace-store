"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const sections = [
    {
      title: "INFORMATION WE COLLECT",
      content: "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide."
    },
    {
      title: "HOW WE USE IT",
      content: "We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users, develop safety features, authenticate users, and send product updates."
    },
    {
      title: "DATA STORAGE",
      content: "We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it. We may retain certain information for legitimate business purposes or as required by law."
    },
    {
      title: "COOKIES",
      content: "We use cookies and similar technologies to remember your preferences and settings, determine the popularity of content, deliver and measure the effectiveness of advertising campaigns, and analyze site traffic and trends."
    },
    {
      title: "YOUR RIGHTS",
      content: "You have the right to request access to the personal data we hold about you, to request that your personal data be corrected or deleted, and to request that we restrict the processing of your personal data."
    },
    {
      title: "CONTACT",
      content: "If you have any questions about this Privacy Policy, please contact us at privacy@menace.in."
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
          PRIVACY POLICY
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
