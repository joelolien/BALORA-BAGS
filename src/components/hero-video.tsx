'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt playback ourselves rather than relying solely on the
    // `autoplay` attribute. If the browser blocks it (e.g. iOS Low Power
    // Mode), we simply leave the static photo showing — no play button,
    // nothing that looks broken. If a later tap unblocks it, onPlaying
    // fires and we quietly cross-fade into the video as a bonus.
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    document.addEventListener('touchstart', tryPlay, { once: true });
    document.addEventListener('click', tryPlay, { once: true });

    return () => {
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('click', tryPlay);
    };
  }, []);

  return (
    <>
      <Image
        src="/images/hero-poster.jpg"
        alt="Handmade Balora crochet bags"
        fill
        priority
        className={`object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        onPlaying={() => setIsPlaying(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
    </>
  );
}
