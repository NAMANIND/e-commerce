"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1475&auto=format&fit=crop", // Colorful toy blocks
  "https://images.unsplash.com/photo-1596073419667-9d77d59f033f?q=80&w=1435&auto=format&fit=crop", // Indoor plants
  "https://images.unsplash.com/photo-1581557991964-125469da3b8a?q=80&w=1470&auto=format&fit=crop", // Educational toys
];

const ROTATION_INTERVAL = 5000; // 5 seconds between slides

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
    setProgress(0);
  };

  useEffect(() => {
    // Clear any existing intervals when component unmounts or dependencies change
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    // Clear existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (!isHovering) {
      // Setup rotation interval
      intervalRef.current = setInterval(
        nextSlide,
        ROTATION_INTERVAL
      ) as unknown as null;

      // Setup progress tracking (update 100 times during the interval)
      const progressStep = 100 / (ROTATION_INTERVAL / 10); // Update every 10ms
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + progressStep;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 10) as unknown as null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, [isHovering, currentIndex]);

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
            src={images[currentIndex]}
            alt={`Slider Image ${currentIndex + 1}`}
            fill
            className="object-cover opacity-70  max-w-7xl mx-auto  "
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
            {currentIndex === 0
              ? "Educational Toys Collection"
              : currentIndex === 1
              ? "Indoor Plants Collection"
              : "Kids Development Toys"}
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
            {currentIndex === 0
              ? "Discover our range of educational toys that make learning fun and engaging."
              : currentIndex === 1
              ? "Transform your space with our selection of beautiful indoor plants."
              : "Help your child grow with our carefully curated developmental toys."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button className="bg-white text-gray-900 hover:bg-gray-200 px-6 py-2 rounded-full">
              {currentIndex === 1 ? "View Plants" : "Shop Toys"}
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

          {/* Progress indicators */}
          <div className="flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className="relative h-1 w-16 bg-white/30 rounded-full overflow-hidden"
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
