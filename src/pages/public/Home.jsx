import React, { useState, useEffect } from "react";

const Home = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("http://localhost:3001/slides");
        if (!res.ok) throw new Error("Failed to fetch slides");
        const data = await res.json();
        setSlides(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const scrollToSlide = (id) => {
    const slide = document.getElementById(id);
    if (slide) {
      slide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  if (loading) return <div>Loading slides...</div>;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-12 flex justify-center">
      <div className="carousel w-full sm:w-full md:w-3/4 rounded-xl overflow-hidden shadow-lg">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            id={`slide${slide.id}`}
            className="carousel-item relative w-full aspect-[4/3] md:aspect-[16/7]"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Text content */}
            <div className="absolute inset-0 flex items-center justify-center sm:justify-start px-1 sm:px-4 md:px-16 text-black z-10">
              <div className="max-w-[95%] sm:max-w-md md:max-w-xl bg-white/30 backdrop-blur-md p-1 sm:p-4 md:p-6 rounded-lg shadow-md border border-white/40">
                <h2 className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-3 break-words leading-tight">
                  {slide.title}
                </h2>
                <p className="text-[10px] sm:text-sm md:text-lg mb-2 sm:mb-4 break-words leading-snug">
                  {slide.subtitle}
                </p>
                <button className="btn btn-primary text-[10px] sm:text-sm px-2 py-1 sm:px-4 sm:py-2">
                  {slide.cta}
                </button>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="absolute flex justify-between transform -translate-y-1/2 left-1 right-1 sm:left-4 sm:right-4 top-1/2 z-20">
              <button
                onClick={() =>
                  scrollToSlide(
                    `slide${
                      slides[(index - 1 + slides.length) % slides.length].id
                    }`
                  )
                }
                className="btn btn-circle text-xs sm:text-base min-w-[30px] h-[30px] sm:min-w-[40px] sm:h-[40px]"
                aria-label="Previous slide"
              >
                ❮
              </button>
              <button
                onClick={() =>
                  scrollToSlide(
                    `slide${slides[(index + 1) % slides.length].id}`
                  )
                }
                className="btn btn-circle text-xs sm:text-base min-w-[30px] h-[30px] sm:min-w-[40px] sm:h-[40px]"
                aria-label="Next slide"
              >
                ❯
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
