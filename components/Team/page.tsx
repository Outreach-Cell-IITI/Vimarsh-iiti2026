import Image from "next/image";
import { Linkedin, Mail, Instagram } from "lucide-react";
import teamMembers from "../../data/TeamMembers.json";

export default function TeamPage() {
  return (
    <main className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Our Team
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center transform hover:-translate-y-2"
            >
              <div className="relative mb-6">
                <div className="w-55 h-60 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Name and Role */}
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {member.name}
              </h3>

              <p className="text-base font-medium text-blue-600 mb-6">
                {member.role}
              </p>

              {/* Divider */}
              <div className="w-16 h-0.5 bg-gray-200 mx-auto mb-6"></div>

              {/* Social Icons */}
              <div className="flex justify-center gap-4">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300 hover:scale-110 shadow-md"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>

                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center bg-red-500 rounded-full hover:bg-red-700 transition-all duration-300 hover:scale-110 shadow-md"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="w-11 h-11 flex items-center justify-center bg-purple-600 rounded-full hover:bg-purple-700 transition-all duration-300 hover:scale-110 shadow-md"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
