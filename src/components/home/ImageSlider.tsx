"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SlideContent {
  image: string;
  title: string;
  description: string;
  buttonText: string;
}

const defaultSlides: SlideContent[] = [
  {
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1475&auto=format&fit=crop",
    title: "Educational Toys Collection",
    description:
      "Discover our range of educational toys that make learning fun and engaging.",
    buttonText: "Shop Toys",
  },
  {
    image:
      "https://images.unsplash.com/photo-1596073419667-9d77d59f033f?q=80&w=1435&auto=format&fit=crop",
    title: "Indoor Plants Collection",
    description:
      "Transform your space with our selection of beautiful indoor plants.",
    buttonText: "View Plants",
  },
  {
    image:
      "https://images.unsplash.com/photo-1581557991964-125469da3b8a?q=80&w=1470&auto=format&fit=crop",
    title: "Kids Development Toys",
    description:
      "Help your child grow with our carefully curated developmental toys.",
    buttonText: "Shop Toys",
  },
];

const ROTATION_INTERVAL = 5000; // 5 seconds between slides

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [slides, setSlides] = useState<SlideContent[]>(defaultSlides);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadSliderContent() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("settings")
          .eq("type", "content")
          .single();

        if (error) throw error;

        if (data?.settings?.slider_content) {
          setSlides(data.settings.slider_content);
        }
      } catch (error) {
        console.error("Error loading slider content:", error);
      }
    }

    loadSliderContent();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (!isHovering) {
      intervalRef.current = setInterval(nextSlide, ROTATION_INTERVAL);

      const progressStep = 100 / (ROTATION_INTERVAL / 10);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + progressStep;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 10);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [isHovering, currentIndex, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative bg-gray-900 text-white overflow-hidden h-96 sm:h-128"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentIndex].image}
            alt={slides[currentIndex].title}
            fill
            className="object-cover opacity-70 max-w-7xl mx-auto"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

      <div className="relative max-w-7xl mx-auto px-8 sm:px-10 lg:px-12 h-full flex flex-col justify-between py-8">
        <div className="flex items-center">
          <motion.h2
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold"
          >
            {slides[currentIndex].title}
          </motion.h2>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <motion.p
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl max-w-xl text-center"
          >
            {slides[currentIndex].description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button className="bg-white text-gray-900 hover:bg-gray-200 px-6 py-2 rounded-full">
              {slides[currentIndex].buttonText}
            </Button>
          </motion.div>
        </div>

        <div className="flex justify-between items-center w-full">
          <Button
            onClick={prevSlide}
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-white/50 bg-black/30 text-white hover:bg-black/50 hover:border-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className="relative h-1 w-16 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                onClick={() => {
                  setCurrentIndex(index);
                  setProgress(0);
                }}
              >
                {index === currentIndex && (
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={nextSlide}
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-white/50 bg-black/30 text-white hover:bg-black/50 hover:border-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
