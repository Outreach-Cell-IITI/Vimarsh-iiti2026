import { Linkedin, Mail, Globe } from "lucide-react";
import Image from "next/image";
import teamMembers from "../../data/People.json";

export default function TeamPage() {
  return (
    <main className="bg-[#e6eaef] min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-10 text-gray-900">
          Committee Members
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-5 text-center"
            >
              <Image
                src={member.image}
                alt={member.name}
                width={180}
                height={220}
                className="mx-auto rounded-md object-cover"
              />

              <h3 className="mt-4 font-semibold text-lg text-gray-900">
                {member.name}
              </h3>

              <p className="text-sm text-gray-600">{member.role}</p>
              <p className="text-sm text-gray-500 mt-2">{member.dept}</p>

              {/* Social Icons */}
              <div className="flex justify-center gap-3 mt-4">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 transition"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-white" />
                  </a>
                )}

                {member.website && (
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 transition"
                    aria-label="Website"
                  >
                    <Globe className="w-4 h-4 text-white" />
                  </a>
                )}

                <a
                  href={`mailto:${member.email}`}
                  className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 transition"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
