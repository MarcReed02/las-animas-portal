import Navbar from "@/components/navbar";
import HeroCarousel from "@/components/HeroCarousel";
import NewsSection from "./NewsSection";
import FeatureIcons from "./FeatureIcons";
import Footer from "./footer";

export default function Page() {
  return (
    <div>
      <Navbar/>
      <HeroCarousel />
      <FeatureIcons />
      <NewsSection />
      <Footer />
    </div>
  )
}
