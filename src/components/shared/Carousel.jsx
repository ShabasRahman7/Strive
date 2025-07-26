import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import api from "../../api/axios"; // ✅ use your custom axios instance

const Carousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await api.get("/slides"); // ✅ call using custom axios
        setSlides(res.data);
      } catch (error) {
        console.error("Failed to fetch slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveIndex((prev) => (prev + 1) % slides.length),
    onSwipedRight: () =>
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length),
    trackMouse: true,
  });

  if (loading) return <div>Loading slides...</div>;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-12">
      <div
        className="w-full rounded-xl overflow-hidden shadow-lg relative"
        {...handlers}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex-shrink-0 w-full aspect-[16/7] min-h-[200px] relative"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-start pl-7 sm:pl-14 md:pl-16 pr-4 text-black z-10">
                <div className="max-w-[95%] sm:max-w-md md:max-w-xl bg-white/30 backdrop-blur-md p-1 sm:p-4 md:p-6 rounded-lg shadow-md border border-white/40">
                  <h2 className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-3 break-words leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-[10px] sm:text-sm md:text-lg mb-2 sm:mb-4 break-words leading-snug">
                    {slide.subtitle}
                  </p>
                  <button
                    className="btn btn-primary text-[10px] sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                    onClick={() =>
                      navigate(`/products?category=${slide.category}`)
                    }
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
