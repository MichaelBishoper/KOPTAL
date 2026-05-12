"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const BANNER_COUNT = 6;

interface BannerProps {
  className?: string;
}

export default function Banner({ className = "" }: BannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop
        dir="rtl"
        className="h-full w-full overflow-hidden shadow-md"
        style={{
          "--swiper-pagination-color": "#ffffff",
          "--swiper-pagination-bullet-inactive-color": "#d1d5db",
          "--swiper-pagination-bullet-size": "12px",
          "--swiper-pagination-bullet-inactive-opacity": "0.5",
        } as React.CSSProperties}
      >
        {Array.from({ length: BANNER_COUNT }, (_, i) => (
          <SwiperSlide key={i + 1}>
            <div className="relative h-full w-full bg-white">
              <Image
                src={`/Banner${i + 1}.png`}
                alt={`Banner ${i + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority={i === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
