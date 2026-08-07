import InfiniteTextBanner from "../components/InfiniteTextBanner"
import { cuisineSectionsBottom, cuisineSectionsTop } from "../data/homepageData"
import AppDownloadSection from "./components/Home/AppDownloadSection"
import Hero from "./components/Home/Hero"
import Section2 from "./components/Home/Section2"
import { Section3 } from "./components/Home/Section3"
import Section4 from "./components/Home/Section4"
import Section5 from "./components/Home/Section5"
import FAQSection from "./components/Home/FAQSection"



const Home = () => {
  return (
    <>
        <Hero />
        <Section2 />
        <InfiniteTextBanner />
        <Section3 />
        {cuisineSectionsTop.map((section) => (
          <Section4 key={section.id} section={section} />
        ))}
        <Section5 />

        {cuisineSectionsBottom.map((section) => (
          <Section4 key={section.id} section={section} />
        ))}

        <div className="my-8">
        <InfiniteTextBanner />

<AppDownloadSection />
        </div>

        <FAQSection />
    </>
  )
}

export default Home