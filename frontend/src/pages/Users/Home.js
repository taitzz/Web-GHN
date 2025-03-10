import Header from "../../components/Header";
import ImageSlider from "../../components/ImageSlider"; 
import VideoAd from "../../components/VideoAD";
import Footer from "../../components/Footer";
import FeatureSection from "../../components/FeatureSection";
import "../../assets/styles/Home.css";

export default function Home() {
    return (
        <div className="dashboard">
            <div className="dashboard__content">
                <Header />
                <div className="dashboard__main">
                    <div>
                        {/* Phần Slider 4 ảnh */}
                        <section className="home-slider">
                            <ImageSlider />
                        </section>

                        {/* Phần Video quảng cáo */}
                        <section className="home-video">
                            <VideoAd />
                        </section>

                        {/* Phần Tính năng nổi bật */}
                        <section className="home-features">
                            <FeatureSection />
                        </section>

                        {/* Footer */}
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
}
