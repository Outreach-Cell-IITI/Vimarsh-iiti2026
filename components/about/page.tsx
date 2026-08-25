import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="w-full bg-[#e6eaef] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">About</h2>

        {/* Description */}
        <p className="text-m text-gray-800 leading-relaxed max-w-5xl mb-14">
          The Academic Outreach Initiatives at IIT Indore are designed to foster
          meaningful engagement with the academic community and society at
          large, promoting knowledge exchange and social responsibility.
          <br />
          <br />
          Through seminars, workshops, and collaborative projects, IIT Indore
          seeks to bridge the gap between academia and society by inspiring
          future researchers, supporting industry innovation, and contributing
          to broader societal progress.
        </p>

        {/* Director Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Left: Director Image */}
            <div className="bg-gray-50 flex flex-col items-center justify-center p-6">
              <Image
                src="/pics/People/director.png"
                alt="Prof. Suhas S. Joshi, Director IIT Indore"
                width={400}
                height={480}
                className="object-contain"
              />

              <div className="mt-4 text-center">
                <p className="text-gray-800 text-xl font-medium italic">
                  Prof. Suhas S. Joshi
                </p>
                <p className="text-m text-gray-600 italic mb-2">
                  <strong> Ph.D., FNAE, FNASc, FNA</strong>
                </p>
                <p className="text-sm text-gray-500">
                  {" "}
                  Director, Indian Institute of Technology Indore
                </p>
              </div>
            </div>

            {/* Right: Director Message */}
            <div className="md:col-span-2 p-8">
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                A Note from the Director’s Desk
              </h3>

              <p className="text-sm text-gray-700 leading-relaxed">
                Established in 2009, the Indian Institute of Technology Indore
                has steadily grown into a centre of excellence in higher
                education, research, and innovation, with a strong emphasis on
                engagement beyond institutional boundaries. As a
                second-generation IIT, the Institute was envisioned to serve not
                only as a hub of advanced learning but also as a conduit for
                knowledge dissemination and societal outreach.
                Interdisciplinarity lies at the core of IIT Indore’s academic
                and research philosophy.
                <br />
                <br />
                By fostering collaboration across engineering, sciences, and the
                humanities, the Institute encourages the exchange of ideas that
                address complex societal and technological challenges. This
                integrative culture enables meaningful dialogue between
                academia, industry, and the wider public.
                <br />
                <br />
                With a dedicated faculty body of over 225 members, including
                internationally recognised scholars, IIT Indore actively
                contributes to national and global research ecosystems. Our
                extensive network of international collaborations further
                enhances academic exchange and outreach, strengthening the
                Institute’s global footprint.
                <br />
                <br />
                The Institute’s involvement in major national initiatives,
                including the ₹100 Cr project under the DST National Mission on
                Cyber-Physical Systems (NMICPS), and ₹ 150 Cr under the same
                scheme for establishing Technology Translational Research Park
                reflects its commitment to advancing frontier technologies while
                nurturing skilled human resources. Through its outreach
                initiatives, IIT Indore remains committed to sharing knowledge,
                inspiring young minds, and fostering a culture of curiosity,
                innovation, and social responsibility. In this context, some of
                the national initiatives here include Hub-Spoke project with IIT
                Indore being Hub for mentoring six academic institutions across
                India under ANRF-PAIR project worth ₹ 100 Cr.
                <br />
                <br />
                “VIMARSH””, IIT Indore’s flagship public outreach program, which
                brings eminent experts from academia and industries to a common
                platform with the young minds, our students, faculty members and
                the school/college students of Indore to discuss and deliberate
                on various cutting-edge science and technology, thereby
                contributing to knowledge dissemination. We, at IIT Indore feel
                it is a big social responsibility to nurture the next generation
                to achieve national goal of a <em>Viksit Bharat</em>. I wish IIT
                Indore’s outreach program-- VIMARSH a big success.
                <br />
                <strong>Jai Hind.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
