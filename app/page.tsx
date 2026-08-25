import HomePage from "@/components/home/page";
import AboutSection from "@/components/about/page";
import EventsPage from "@/components/events/page";
import ColloquiumPage from "@/components/colloquium/page";
import PeoplePage from "@/components/People/page";
import TeamPage from "@/components/Team/page";
import DepartmentalOutreachPage from "@/components/departmental-outreach/page";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-gray-100">
      {/* HERO */}
      <section id="home">
        <HomePage />
      </section>
      {/* ABOUT */}
      <section id="about">
        <AboutSection />
      </section>

      {/* PEOPLE */}
      <section id="people">
        <PeoplePage />
      </section>

      {/* EVENTS */}
      <section id="events">
        <EventsPage />
      </section>
      {/* INSTITUTE COLLOQUIUM */}
      <section id="colloquium">
        <ColloquiumPage />
      </section>
      {/* DEPARTMENTAL OUTREACH */}
      <section id="outreach">
        <DepartmentalOutreachPage />
      </section>
      {/* TEAM */}
      <section id="team">
        <TeamPage />
      </section>
      {/* FOOTER */}
      <Footer />
    </main>
  );
}
