'use client';

import { useEffect, useRef } from 'react';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Some mobile browsers (notably iOS in Low Power Mode) silently block
    // autoplay even with muted+playsInline set. Retry playback once the
    // video is actually ready, and again on the visitor's first tap
    // anywhere on the page — this recovers playback without ever showing
    // native video controls.
    const tryPlay = () => video.play().catch(() => {});
    video.addEventListener('canplay', tryPlay);
    document.addEventListener('touchstart', tryPlay, { once: true });
    document.addEventListener('click', tryPlay, { once: true });

    return () => {
      video.removeEventListener('canplay', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('click', tryPlay);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/images/hero-poster.jpg"
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}
