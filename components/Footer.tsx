"use client";

import { Mail, Globe, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import footerData from "@/data/footer.json";
import type { Variants } from "framer-motion";
type Person = {
  name: string;
  linkedin: string;
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};


const item: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Footer() {
  const { identity, contact, faculty, students } = footerData;

  return (
    <footer className="relative bg-gradient-to-b from-gray-950 to-gray-900 text-gray-300 mt-24">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12"
      >
        {/* Identity */}
        <motion.div variants={item}>
          <h3 className="text-2xl font-semibold text-white mb-3">
            {identity.title}
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            {identity.subtitle}
            <br />
            {identity.institute}
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div variants={item}>
          <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3 hover:text-white transition">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${contact.email}`} className="hover:underline">
                {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-3 hover:text-white transition">
              <Globe className="w-4 h-4" />
              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                https://vimarsh.iiti.ac.in
              </a>
            </li>
            <li className="flex items-center gap-3 hover:text-white transition">
              <Youtube className="w-4 h-4" />
              <a
                href={contact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Outreach Cell – IIT Indore
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Faculty */}
        <motion.div variants={item}>
          <h4 className="text-lg font-semibold text-white mb-4">Faculty</h4>
          <ul className="text-sm space-y-2">
            {(faculty as Person[]).map((person) => (
              <li key={person.name}>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition"
                >
                  {person.name}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Students */}
        <motion.div variants={item}>
          <h4 className="text-lg font-semibold text-white mb-4">
            Student Team
          </h4>
          <ul className="text-sm space-y-2">
            {(students as Person[]).map((person) => (
              <li key={person.name}>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline transition"
                >
                  {person.name}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Divider */}
      <div className="border-t border-gray-800 mx-6" />

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p className="text-sm text-gray-400 text-center sm:text-left">
          Developed with ♡ by
          <a
            href="https://www.linkedin.com/in/anandvivek1223/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-gray-300 hover:text-blue-400 font-medium transition"
          >
            Anand Vivek
          </a>
        </p>

        <p className="text-sm text-gray-500 text-center sm:text-right">
          © 2026  Outreach Cell, IIT Indore. All rights
          reserved.
        </p>
      </motion.div>
    </footer>
  );
}
