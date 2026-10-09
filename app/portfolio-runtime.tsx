'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import Lenis from 'lenis';

type FrameCallback = (time: number) => void;
interface MotionBridge {
  requestFrame(callback: FrameCallback): number;
  cancelFrame(id: number): void;
  ease: typeof gsap.parseEase;
}
declare global {
  interface Window { portfolioMotion: MotionBridge; portfolioRuntimeReady?: Promise<void>; }
}

function initialiseRuntime(): Promise<void> {
  let nextId = 0;
  let smoothScroll: Lenis | undefined;
  const frames = new Map<number, FrameCallback>();
  gsap.config({ autoSleep: 0 });
  gsap.ticker.add((time) => {
    if(document.hidden)return;
    smoothScroll?.raf(time * 1000);
    const pending = [...frames.values()];
    frames.clear();
    const now = performance.now();
    for(const callback of pending)callback(now);
  });
  window.portfolioMotion = {
    requestFrame(callback) {
      const id = ++nextId;
      frames.set(id, callback);
      return id;
    },
    cancelFrame(id) { frames.delete(id); },
    ease: gsap.parseEase,
  };
  gsap.ticker.lagSmoothing(0);
  document.body.classList.toggle('work-page', location.pathname.startsWith('/work'));
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/portfolio-runtime.js';
    script.onload = () => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const configureScroll = () => {
        smoothScroll?.destroy();
        smoothScroll = reduced.matches ? undefined : new Lenis({
          autoRaf: false, lerp: .12, smoothWheel: true, syncTouch: false,
          prevent: node => !!node.closest('#menu'),
        });
        document.documentElement.dataset.smoothScroll = String(!!smoothScroll);
      };
      configureScroll();
      reduced.addEventListener('change', configureScroll);
      document.addEventListener('portfolio:route', () => {
        smoothScroll?.resize();
        smoothScroll?.scrollTo(window.scrollY, { immediate: true });
      });
      resolve();
    };
    script.onerror = () => reject(new Error('Could not load portfolio interactions'));
    document.body.append(script);
  });
}

export function PortfolioRuntime() {
  useEffect(() => {
    // One shared document owns the canvas, audio and reversible scroll scenes.
    // Keep it alive across the existing mosaic navigation and Strict Mode replay.
    window.portfolioRuntimeReady ??= initialiseRuntime();
    window.portfolioRuntimeReady.catch(error => {
      console.error(error);
      document.querySelector('.boot')?.classList.add('loaded');
    });
  }, []);
  return null;
}
