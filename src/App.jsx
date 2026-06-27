import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  ChevronRight, 
  Volume2, 
  Battery, 
  Wifi, 
  CheckCircle2, 
  CreditCard,
  Play,
  Pause,
  Sliders,
  Activity,
  Compass,
  Settings,
  SkipBack,
  SkipForward
} from 'lucide-react';

// --- Web Audio API Synth for Spatial Audio Panning ---
const playSpatialSynth = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  
  try {
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const panNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // Low A bass note
    osc2.type = 'triangle';
    osc2.frequency.value = 110; // Octave harmonic

    filter.type = 'lowpass';
    filter.frequency.value = 250;

    // LFO for filter pulsing
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.6; 
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // LFO for panning sweep (Spatial audio demonstration)
    let panLfo = null;
    if (panNode) {
      panLfo = ctx.createOscillator();
      const panGain = ctx.createGain();
      panLfo.frequency.value = 0.25; // sweeps side-to-side every 4 seconds
      panGain.gain.value = 0.85; 
      panLfo.connect(panGain);
      panGain.connect(panNode.pan);
    }

    osc1.connect(filter);
    osc2.connect(filter);
    
    let lastNode = filter;
    if (panNode) {
      filter.connect(panNode);
      lastNode = panNode;
    }
    
    lastNode.connect(gain);
    gain.connect(ctx.destination);

    // Smooth fade in
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.4);

    osc1.start();
    osc2.start();
    lfo.start();
    if (panLfo) panLfo.start();

    return {
      stop: () => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
          setTimeout(() => {
            osc1.stop();
            osc2.stop();
            lfo.stop();
            if (panLfo) panLfo.stop();
            ctx.close();
          }, 450);
        } catch (e) {
          console.error(e);
        }
      }
    };
  } catch (e) {
    console.error("Audio Context initialization failed", e);
    return null;
  }
};

// --- Custom Hooks for Motion & Scroll Storytelling ---

// Screen-size independent scroll progress tracker (ScrollTrigger-like implementation)
const useElementScrollProgress = (elementRef) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const elementHeight = rect.height;
      const elementTop = rect.top;
      
      const viewportHeight = window.innerHeight;
      const scrollableRange = elementHeight - viewportHeight;
      if (scrollableRange <= 0) return;
      
      // Calculate scroll progress (0 when top pins, 1 when bottom is reached)
      const scrolled = -elementTop;
      const currentProgress = scrolled / scrollableRange;
      
      setProgress(Math.max(0, Math.min(1, currentProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, [elementRef]);

  return progress;
};

// Global scroll Y tracker for parallax and hero effects
const useWindowScrollY = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

const useIntersection = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isIntersecting];
};

// --- Reusable Motion Components ---

const FadeIn = ({ children, delay = 0, className = '', wrapperClass = '', direction = 'up' }) => {
  const [ref, isVisible] = useIntersection(0.06);
  
  const getTransform = () => {
    if (isVisible) return 'translate-y-0 translate-x-0';
    switch (direction) {
      case 'up': return 'translate-y-12';
      case 'down': return '-translate-y-12';
      case 'left': return 'translate-x-12';
      case 'right': return '-translate-x-12';
      default: return 'translate-y-12';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${getTransform()} ${className} ${wrapperClass}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Cursor-tracking spotlight card component
const SpotlightCard = ({ children, wrapperClass = '', innerClassName = '', delay = 0, direction = 'up' }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <FadeIn delay={delay} direction={direction} className="h-full w-full" wrapperClass={wrapperClass}>
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-md group hover:border-[#adc6ff]/20 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] hover:scale-[1.02] transition-all duration-500 p-8 md:p-10 h-full w-full flex flex-col justify-end ${innerClassName}`}
      >
        {/* Dynamic radial gradient follow spotlight */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.12), transparent 45%)`
          }}
        />
        {/* Spotlight border effect */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 border border-indigo-500/25"
          style={{
            maskImage: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, black, transparent)`
          }}
        />
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {typeof children === 'function' ? children({ isHovered }) : children}
        </div>
      </div>
    </FadeIn>
  );
};

// --- Custom Subcomponents for Bento Features ---

// HTML5 Canvas Sine Waves for Spatial Audio Card
const CanvasWaves = ({ isHovered }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.parentElement.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.lineWidth = 1.8;
      
      const waves = [
        { amplitude: isHovered ? 40 : 15, frequency: 0.015, color: 'rgba(99, 102, 241, 0.45)', speed: 0.06 },
        { amplitude: isHovered ? 25 : 10, frequency: 0.025, color: 'rgba(168, 85, 247, 0.35)', speed: -0.04 },
        { amplitude: isHovered ? 12 : 5, frequency: 0.035, color: 'rgba(236, 72, 153, 0.15)', speed: 0.08 }
      ];

      waves.forEach(w => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * w.frequency + phase * w.speed) * w.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      phase += 0.4;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isHovered]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-[2.5rem]" />;
};

// Battery Charge Simulator
const BatteryFeature = ({ isHovered }) => {
  const [charge, setCharge] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setIsCharging(true);
      setCharge(0);
    }
  }, [isHovered]);

  useEffect(() => {
    if (isCharging) {
      if (charge < 100) {
        const timer = setTimeout(() => setCharge(prev => Math.min(prev + 4, 100)), 25);
        return () => clearTimeout(timer);
      } else {
        setIsCharging(false);
      }
    }
  }, [charge, isCharging]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none flex items-center justify-center">
      <div className="flex flex-col items-center justify-center -mt-16">
        <div className="relative w-24 h-11 border-[1.5px] border-white/10 rounded-xl p-1 flex items-center justify-start bg-[#040405]">
          <div 
            className={`h-full bg-[#ADC6FF] rounded-lg transition-all duration-75 ${
              charge === 100 ? 'shadow-[0_0_20px_rgba(173,198,255,0.4)] bg-[#ADC6FF]' : 'bg-[#ADC6FF]/70'
            }`}
            style={{ width: `${charge}%` }}
          />
          <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-1 h-3.5 bg-white/20 rounded-r-sm" />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#040405] font-mono">
            {charge}%
          </span>
        </div>
        <p className="text-[10px] text-[#ADC6FF] font-mono mt-3 uppercase tracking-[0.2em] font-semibold">
          {charge === 100 ? 'Fully Charged' : 'Refueling...'}
        </p>
      </div>
    </div>
  );
};

// Seamless Ecosystem Synchronizing Animation
const EcosystemFeature = () => {
  const [activeDevice, setActiveDevice] = useState('phone');

  useEffect(() => {
    const devices = ['phone', 'tablet', 'desktop'];
    const timer = setInterval(() => {
      setActiveDevice(prev => {
        const index = devices.indexOf(prev);
        return devices[(index + 1) % devices.length];
      });
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none flex items-center justify-center z-10 opacity-70">
      <div className="flex items-center space-x-5 -mt-16 p-5 bg-[#040405]/50 border border-[#C8CCD4]/10 rounded-2xl">
        <div className={`p-3.5 rounded-xl transition-all duration-500 border ${
          activeDevice === 'phone' 
            ? 'bg-[#ADC6FF]/10 border-[#ADC6FF]/40 shadow-[0_0_15px_rgba(173,198,255,0.25)] text-[#ADC6FF]' 
            : 'border-[#C8CCD4]/10 text-[#C8CCD4]/40'
        }`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>

        <div className="w-8 h-1 flex items-center justify-center relative">
          <div className="absolute w-2 h-2 rounded-full bg-[#ADC6FF]/40 animate-ping" />
          <div className="w-full h-[1px] bg-[#ADC6FF]/30 animate-pulse" />
        </div>

        <div className={`p-3.5 rounded-xl transition-all duration-500 border ${
          activeDevice === 'tablet' 
            ? 'bg-[#ADC6FF]/10 border-[#ADC6FF]/40 shadow-[0_0_15px_rgba(173,198,255,0.25)] text-[#ADC6FF]' 
            : 'border-[#C8CCD4]/10 text-[#C8CCD4]/40'
        }`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>

        <div className="w-8 h-1 flex items-center justify-center relative">
          <div className="absolute w-2 h-2 rounded-full bg-[#ADC6FF]/40 animate-ping" />
          <div className="w-full h-[1px] bg-[#ADC6FF]/30 animate-pulse" />
        </div>

        <div className={`p-3.5 rounded-xl transition-all duration-500 border ${
          activeDevice === 'desktop' 
            ? 'bg-[#ADC6FF]/10 border-[#ADC6FF]/40 shadow-[0_0_15px_rgba(173,198,255,0.25)] text-[#ADC6FF]' 
            : 'border-[#C8CCD4]/10 text-[#C8CCD4]/40'
        }`}>
          <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Titanium Exoskeleton Feature
const TitaniumFeature = ({ isHovered }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 flex items-center justify-center -mt-12">
        <div className="relative w-full h-full border border-[#C8CCD4]/10 rounded-2xl bg-gradient-to-tr from-[#040405] via-[#050508] to-[#040405] shadow-inner flex items-center justify-center overflow-hidden">
          {/* Metal shine gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-[#C8CCD4]/10 to-transparent -translate-x-full ${
            isHovered ? 'translate-x-full transition-transform duration-[1200ms] ease-out' : ''
          }`} />
          
          <div className="text-[10px] font-mono text-[#C8CCD4]/50 text-center tracking-widest leading-normal">
            TITANIUM EXOSKELETON<br />
            STRESS LIMIT: EXCELLENT<br />
            MASS CORES: <span className="text-[#ADC6FF] font-extrabold">240G</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Active Noise Cancellation (ANC) Sound Wave Collapser
const ANCFeature = ({ isHovered }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.parentElement.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.lineWidth = 1.5;

      if (isHovered) {
        // Draw primary soundwave (fading)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(173, 198, 255, 0.3)'; 
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.04 + phase * 0.05) * 18 * (1 - x / width);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw phase-inverted soundwave (cancelling)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(200, 204, 212, 0.3)'; 
        for (let x = 0; x < width; x++) {
          const y = height / 2 - Math.sin(x * 0.04 + phase * 0.05) * 18 * (1 - x / width);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Neutralized flatline
        ctx.beginPath();
        ctx.strokeStyle = '#ADC6FF'; 
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Normal active wave
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(173, 198, 255, 0.6)';
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.035 + phase * 0.04) * 22;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += 0.5;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isHovered]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-[70%] mt-[-20%] object-cover opacity-80" />
      {isHovered && (
        <div className="absolute top-[28%] bg-[#ADC6FF]/10 border border-[#ADC6FF]/30 px-4 py-1.5 rounded-full text-[10px] font-mono font-bold text-[#ADC6FF] uppercase tracking-widest animate-pulse">
          Neutralized -48dB
        </div>
      )}
    </div>
  );
};

// Nano H1 Chip Feature
const ChipFeature = ({ isHovered }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden flex items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center -mt-16">
        <div className="relative w-24 h-24 bg-[#050508] border border-[#C8CCD4]/10 rounded-2xl flex items-center justify-center shadow-lg transition-colors group-hover:border-[#ADC6FF]/35">
          <div className={`w-10 h-10 rounded-xl bg-[#ADC6FF]/20 border border-[#ADC6FF]/40 flex items-center justify-center shadow-md transition-all duration-500 ${
            isHovered ? 'shadow-[0_0_30px_rgba(173,198,255,0.6)] scale-110' : 'opacity-85'
          }`}>
            <span className="text-[12px] font-bold text-[#ADC6FF] tracking-tighter">H1</span>
          </div>
          
          <svg className={`absolute inset-0 w-full h-full text-[#C8CCD4] transition-colors duration-500 ${
            isHovered ? 'text-[#ADC6FF]/60' : 'opacity-30'
          }`} viewBox="0 0 80 80">
            <path d="M 25,0 L 25,20 M 40,0 L 40,20 M 55,0 L 55,20" stroke="currentColor" strokeWidth="1.5" strokeDasharray={isHovered ? "2 2" : "none"} className={isHovered ? "animate-pulse" : ""} />
            <path d="M 25,80 L 25,60 M 40,80 L 40,60 M 55,80 L 55,60" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 0,25 L 20,25 M 0,40 L 20,40 M 0,55 L 20,55" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 80,25 L 60,25 M 80,40 L 60,40 M 80,55 L 60,55" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Scroll-linked Exploded Blueprint Assembly SVG
const BlueprintAssembly = ({ progress }) => {
  // Advanced ease function
  const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const p = ease(Math.max(0, Math.min(1, progress)));
  const invP = 1 - p;

  // Assembly Displacements
  const headbandY = invP * -60;
  const leftCupX = invP * -70;
  const rightCupX = invP * 70;
  const coreZ = invP * 40;
  const opacityFade = p * 0.8 + 0.2; // 0.2 to 1.0

  return (
    <div className="relative w-full max-w-md aspect-square rounded-[2rem] bg-[#040405] border border-[#C8CCD4]/10 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] p-6 flex flex-col justify-between">
      
      {/* Blueprint Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(#ADC6FF 1px, transparent 1px), linear-gradient(90deg, #ADC6FF 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          transform: `perspective(500px) rotateX(60deg) translateY(${progress * 20}px) scale(2)`,
          transformOrigin: 'top center'
        }}
      />
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(173,198,255,0.08)_0%,_transparent_60%)] pointer-events-none" />

      {/* Top Tech HUD */}
      <div className="relative z-10 flex justify-between items-start text-[9px] font-mono text-[#C8CCD4]/40 uppercase tracking-widest leading-relaxed">
        <div>
          <span className="text-[#ADC6FF] font-bold">SYSTEM:</span> AURALIS SPATIAL<br />
          <span className="text-[#ADC6FF] font-bold">CHASSIS:</span> AEROSPACE TITANIUM<br />
          <span className="text-[#ADC6FF] font-bold">CORE:</span> PRO v4 NEURAL
        </div>
        <div className="text-right">
          COORD: X_17_Y_9<br />
          LOCK: <span className={p === 1 ? 'text-[#ADC6FF]' : ''}>{p === 1 ? 'ENGAGED' : 'UNLOCKED'}</span><br />
          STATUS: {Math.round(p * 100)}% MERGED
        </div>
      </div>

      {/* Animated SVG Graphic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-[120%] h-[120%] max-w-[500px]" viewBox="0 0 300 300" fill="none" stroke="currentColor">
          
          {/* Connecting Laser Guide Lines (only visible when unassembled) */}
          <g stroke="#ADC6FF" strokeWidth="0.5" strokeDasharray="4,4" opacity={invP * 0.4}>
            {/* Left to center */}
            <path d={`M 150,150 L ${150 + leftCupX},150`} />
            {/* Right to center */}
            <path d={`M 150,150 L ${150 + rightCupX},150`} />
            {/* Top to center */}
            <path d={`M 150,150 L 150,${150 + headbandY}`} />
          </g>

          {/* Central Neural Core (Moves on Y/Scale) */}
          <g transform={`translate(150, ${150 - coreZ}) scale(${1 + invP * 0.5})`} opacity={opacityFade}>
            {/* Outer rings */}
            <circle cx="0" cy="0" r="28" stroke="#ADC6FF" strokeWidth="1" strokeDasharray="1 4" opacity="0.3" transform={`rotate(${progress * 90})`} />
            <circle cx="0" cy="0" r="22" stroke="#C8CCD4" strokeWidth="0.5" opacity="0.4" />
            <circle cx="0" cy="0" r="15" stroke="#ADC6FF" strokeWidth="1.5" opacity="0.8" />
            
            {/* Inner chip detailed pattern */}
            <path d="M -5,-5 L 5,-5 L 5,5 L -5,5 Z" fill="rgba(173,198,255,0.1)" stroke="#ADC6FF" strokeWidth="1" />
            <circle cx="0" cy="0" r="2" fill="#ADC6FF" />
            
            {/* Animated data lines radiating from core when fully assembled */}
            {p > 0.9 && (
              <g stroke="#ADC6FF" strokeWidth="1" opacity={(p - 0.9) * 10}>
                <line x1="-15" y1="0" x2="-30" y2="0" />
                <line x1="15" y1="0" x2="30" y2="0" />
                <line x1="0" y1="-15" x2="0" y2="-30" />
              </g>
            )}
          </g>

          {/* Headband Assembly */}
          <g transform={`translate(150, ${150 + headbandY})`} stroke="#C8CCD4" opacity={opacityFade}>
            {/* Main Arch */}
            <path d="M -75,-10 C -75,-60 75,-60 75,-10" strokeWidth="3" strokeLinecap="round" />
            {/* Inner cushion layer */}
            <path d="M -65,-12 C -65,-50 65,-50 65,-12" stroke="#ADC6FF" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" strokeDasharray="3 3" />
            {/* Mechanical joints */}
            <rect x="-80" y="-12" width="10" height="14" rx="2" fill="#040405" stroke="#ADC6FF" strokeWidth="1" />
            <rect x="70" y="-12" width="10" height="14" rx="2" fill="#040405" stroke="#ADC6FF" strokeWidth="1" />
          </g>

          {/* Left Ear Cup */}
          <g transform={`translate(${150 + leftCupX}, 150)`} opacity={opacityFade}>
            {/* Shell */}
            <path d="M -75,-25 C -90,-25 -95,-5 -95,15 C -95,35 -90,55 -75,55 Z" fill="#050508" stroke="#C8CCD4" strokeWidth="2" />
            {/* Inner mechanism */}
            <path d="M -75,-15 C -85,-15 -88,-2 -88,15 C -88,32 -85,45 -75,45 Z" fill="#040405" stroke="#ADC6FF" strokeWidth="1" opacity="0.6" />
            {/* Cushion */}
            <path d="M -70,-28 C -65,-28 -60,-8 -60,15 C -60,38 -65,58 -70,58 Z" fill="#040405" stroke="#C8CCD4" strokeWidth="1.5" opacity="0.8" />
            {/* Soundwaves appearing on full assembly */}
            {p > 0.95 && (
              <path d="M -50,0 Q -40,15 -50,30" stroke="#ADC6FF" strokeWidth="1.5" fill="none" opacity={(p - 0.95) * 20} className="animate-pulse" />
            )}
          </g>

          {/* Right Ear Cup */}
          <g transform={`translate(${150 + rightCupX}, 150)`} opacity={opacityFade}>
            {/* Shell */}
            <path d="M 75,-25 C 90,-25 95,-5 95,15 C 95,35 90,55 75,55 Z" fill="#050508" stroke="#C8CCD4" strokeWidth="2" />
            {/* Inner mechanism */}
            <path d="M 75,-15 C 85,-15 88,-2 88,15 C 88,32 85,45 75,45 Z" fill="#040405" stroke="#ADC6FF" strokeWidth="1" opacity="0.6" />
            {/* Cushion */}
            <path d="M 70,-28 C 65,-28 60,-8 60,15 C 60,38 65,58 70,58 Z" fill="#040405" stroke="#C8CCD4" strokeWidth="1.5" opacity="0.8" />
            {/* Soundwaves appearing on full assembly */}
            {p > 0.95 && (
              <path d="M 50,0 Q 40,15 50,30" stroke="#ADC6FF" strokeWidth="1.5" fill="none" opacity={(p - 0.95) * 20} className="animate-pulse" />
            )}
          </g>

        </svg>
      </div>
      
      {/* Bottom HUD elements */}
      <div className="relative z-10 w-full mt-auto pt-4 border-t border-[#C8CCD4]/10 flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-1 rounded-sm transition-all duration-300" style={{ backgroundColor: p > i/5 ? '#ADC6FF' : 'rgba(200, 204, 212, 0.1)' }} />
          ))}
        </div>
        <div className="w-6 h-6 rounded-full border-2 border-[#ADC6FF] border-t-transparent animate-spin" style={{ animationDuration: '3s', opacity: invP }} />
      </div>
    </div>
  );
};

// Canvas Dynamic Floating Particles Background
const HeroCanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let mouse = { x: null, y: null };

    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 1 + Math.random() * 2,
        baseColor: i % 2 === 0 ? 'rgba(173, 198, 255, 0.15)' : 'rgba(200, 204, 212, 0.1)',
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3
      });
    }

    const draw = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        if (mouse.x && mouse.y) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            p.x += (dx / dist) * 0.4;
            p.y += (dy / dist) * 0.4;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.baseColor;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none -z-10" />;
};

// ─── App Screen Data ─────────────────────────────────────────────────────────
const APP_SCREENS = [
  {
    id: 'tune',
    label: 'Tune',
    src: '/screens/tune.png',
    accent: '#adc6ff',
    desc: 'Master 6-band equalizer with per-frequency precision control and timbre shaping.'
  },
  {
    id: 'spatial',
    label: 'Spatial',
    src: '/screens/spatial.png',
    accent: '#adc6ff',
    desc: 'Spatial Volume Engine — immersive 3D audio mapping with ANC mode selection.'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    src: '/screens/analytics.png',
    accent: '#adc6ff',
    desc: 'Live acoustic spectrum analysis with dB levels, purity scores and active time.'
  },
  {
    id: 'settings',
    label: 'Settings',
    src: '/screens/settings.png',
    accent: '#adc6ff',
    desc: 'Full device management: LDAC codec, multipoint, spatial personalization & auto-pause.'
  },
];

// ─── Hero Phone Fan — Scroll-Driven ────────────────────────────────────────
// The hero section is 220vh. This component reads scroll progress from its
// container ref and fans the phones out accordingly.
// scrollP = 0  → all 4 phones stacked dead-center, un-rotated
// scrollP = 1  → fully fanned at their final positions
const HeroPhoneFan = ({ isPlaying, toggleSound, scrollP }) => {
  const [activeIdx, setActiveIdx] = useState(1);

  // Final fanned positions (where each phone ends up at scrollP=1)
  // Adjusted for mathematically even spacing (290px between each center point)
  // This tightens the overall spread from 1020px to 870px to prevent edge clipping
  const FAN_FINAL = [
    { x: -435, y: 35,  rot: -15, scale: 0.78, z: 1 },
    { x: -145, y: 12,  rot: -5,  scale: 0.90, z: 3 },
    { x:  145, y: 12,  rot:  5,  scale: 0.90, z: 2 },
    { x:  435, y: 35,  rot:  15, scale: 0.78, z: 1 },
  ];

  // Lerp helper
  const lerp = (a, b, t) => a + (b - a) * t;
  // Ease-out cubic for smoother fan
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const p = ease(Math.max(0, Math.min(1, scrollP)));

  const getCardStyle = (idx) => {
    const f = FAN_FINAL[idx];
    const tx = lerp(0, f.x, p);
    const ty = lerp(0, f.y, p);
    const rot = lerp(0, f.rot, p);
    const sc = lerp(1, f.scale, p);
    // Ensure the active screen (defaults to 1 - Spatial) is always on top, especially when stacked
    const zIdx = idx === activeIdx ? 10 : f.z;
    const dim = lerp(0, 0, p); // Optionally dim logic removed or kept 0

    return {
      transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${sc})`,
      zIndex: zIdx,
      filter: `brightness(${1 - dim})`,
      transition: 'filter 0.3s ease, z-index 0.3s ease',
      cursor: 'pointer',
    };
  };

  // Phone shell: 240×520 — close to iPhone 17 Pro Max 9:19.5 aspect ratio
  const PHONE_W = 240;
  const PHONE_H = 520;
  const BORDER_R = 44; // outer corner radius px (maps to ~2.75rem)
  const INNER_R = 38; // inner screen radius

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: '100%', height: `${PHONE_H + 80}px` }}
    >
      {APP_SCREENS.map((screen, idx) => (
        <div
          key={screen.id}
          className="absolute"
          style={getCardStyle(idx)}
          onClick={() => setActiveIdx(idx)}
        >
          {/* ── Phone outer shell ── */}
          <div
            style={{
              width: `${PHONE_W}px`,
              height: `${PHONE_H}px`,
              borderRadius: `${BORDER_R}px`,
              background: 'linear-gradient(160deg, #242427 0%, #171719 60%, #111113 100%)',
              boxShadow: idx === activeIdx
                ? `0 0 0 1px rgba(255,255,255,0.10), 0 50px 100px -20px rgba(0,0,0,0.95), 0 0 70px rgba(173,198,255,0.14), inset 0 1px 0 rgba(255,255,255,0.06)`
                : `0 0 0 1px rgba(255,255,255,0.04), 0 25px 50px -15px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.03)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Side buttons — mute */}
            <div style={{ position:'absolute', top:'90px', left:'-3px', width:'3px', height:'22px', background:'#2c2c2e', borderRadius:'2px 0 0 2px' }} />
            {/* Vol up */}
            <div style={{ position:'absolute', top:'122px', left:'-3px', width:'3px', height:'38px', background:'#2c2c2e', borderRadius:'2px 0 0 2px' }} />
            {/* Vol down */}
            <div style={{ position:'absolute', top:'168px', left:'-3px', width:'3px', height:'38px', background:'#2c2c2e', borderRadius:'2px 0 0 2px' }} />
            {/* Power */}
            <div style={{ position:'absolute', top:'138px', right:'-3px', width:'3px', height:'58px', background:'#2c2c2e', borderRadius:'0 2px 2px 0' }} />

            {/* ── Screen bezel (2.5px inset each side) ── */}
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: '3px',
                right: '3px',
                bottom: '3px',
                borderRadius: `${INNER_R}px`,
                overflow: 'hidden',
                background: '#000',
              }}
            >
              {/* App screen image — fills the entire screen area */}
              <img
                src={screen.src}
                alt={screen.label}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  display: 'block',
                }}
                draggable={false}
              />

              {/* Dynamic Island overlay when playing */}
              {idx === activeIdx && isPlaying && (
                <div style={{ position:'absolute', top:'10px', left:'50%', transform:'translateX(-50%)', zIndex:30, width:'88%' }}>
                  <img src="/screens/dynamic_island.png" alt="Dynamic Island" style={{ width:'100%', borderRadius:'16px' }} />
                </div>
              )}

              {/* ── Dynamic Island pill notch ── */}
              {/* This sits ON TOP of the image, same color as phone bg */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '72px',
                  height: '20px',
                  background: '#000',
                  borderRadius: '20px',
                  zIndex: 25,
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.8)',
                }}
              />

              {/* Gloss shimmer top edge */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '120px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            </div>

            {/* Rim light top-left */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.12) 60%, transparent 90%)',
                borderRadius: `${BORDER_R}px ${BORDER_R}px 0 0`,
              }}
            />
          </div>

          {/* Screen label */}
          <div
            style={{
              marginTop: '10px',
              textAlign: 'center',
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontWeight: '700',
              color: idx === activeIdx ? '#adc6ff' : 'rgba(255,255,255,0.18)',
              transition: 'color 0.3s ease',
            }}
          >
            {screen.label}
          </div>
        </div>
      ))}

      {/* Play button below the fan */}
      <button
        onClick={toggleSound}
        className="absolute flex items-center gap-2 spring-press"
        style={{
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '9px 20px',
          borderRadius: '100px',
          border: '1px solid rgba(173,198,255,0.28)',
          background: 'rgba(173,198,255,0.08)',
          color: '#adc6ff',
          fontSize: '10px',
          fontWeight: '700',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          zIndex: 30,
          backdropFilter: 'blur(8px)',
          transition: 'background 0.3s ease',
        }}
      >
        {isPlaying ? <Pause style={{ width:'12px', height:'12px' }} /> : <Play style={{ width:'12px', height:'12px' }} />}
        <span>{isPlaying ? 'Pause Demo' : 'Play Spatial Demo'}</span>
      </button>
    </div>
  );
};

// ─── App Prototype Component (Bottom Section) ─────────────────────────────────
// Full interactive tab-switching prototype with real screen.png images.
const AppPrototype = () => {
  const [activeScreen, setActiveScreen] = useState(1);
  const [prevScreen, setPrevScreen] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDynIsland, setShowDynIsland] = useState(false);
  
  const containerRef = useRef(null);
  const progress = useElementScrollProgress(containerRef);

  // Scroll Sync Logic
  useEffect(() => {
    if (isTransitioning) return;
    
    let targetIdx = 1;
    let dynIsland = false;
    
    if (progress < 0.2) {
      targetIdx = 1;
      dynIsland = false;
    } else if (progress < 0.4) {
      targetIdx = 1;
      dynIsland = true;
    } else if (progress < 0.6) {
      targetIdx = 0;
      dynIsland = false;
    } else if (progress < 0.8) {
      targetIdx = 2;
      dynIsland = false;
    } else {
      targetIdx = 3;
      dynIsland = false;
    }
    
    if (activeScreen !== targetIdx) {
      setActiveScreen(targetIdx);
    }
    if (showDynIsland !== dynIsland) {
      setShowDynIsland(dynIsland);
    }
  }, [progress, isTransitioning, activeScreen, showDynIsland]);

  const scrollToPhase = (targetProgress, idx, dynIsland = false) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const totalScroll = rect.height - window.innerHeight;
    
    setIsTransitioning(true);
    setPrevScreen(activeScreen);
    
    window.scrollTo({
      top: absoluteTop + (totalScroll * targetProgress),
      behavior: 'smooth'
    });
    
    setActiveScreen(idx);
    setShowDynIsland(dynIsland);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setPrevScreen(null);
    }, 400); // Allow time for scroll to settle
  };

  const handleTabClick = (idx) => {
    if (idx === 1) scrollToPhase(0.1, 1, false);
    if (idx === 0) scrollToPhase(0.5, 0, false);
    if (idx === 2) scrollToPhase(0.7, 2, false);
    if (idx === 3) scrollToPhase(0.9, 3, false);
  };

  const handleToggleIsland = () => {
    if (showDynIsland) {
      scrollToPhase(0.1, 1, false);
    } else {
      scrollToPhase(0.3, 1, true);
    }
  };

  return (
    <div ref={containerRef} className="h-[400vh] w-full relative -mt-36">
      <div className="sticky top-0 h-screen flex flex-col lg:flex-row items-center justify-center gap-16 w-full pt-20">
        {/* Phone frame */}
        <div className="flex-shrink-0 relative" style={{ width: '280px', height: '600px' }}>
          {/* Outer shell */}
          <div
            className="absolute inset-0 rounded-[3.2rem] bg-[#171719]"
            style={{
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 50px 120px -20px rgba(0,0,0,0.95), 0 0 80px rgba(173,198,255,0.08)'
            }}
          >
            {/* Side buttons */}
            <div className="absolute top-28 -left-0.5 w-1 h-7 bg-[#2a2a2c] rounded-l-sm" />
            <div className="absolute top-40 -left-0.5 w-1 h-12 bg-[#2a2a2c] rounded-l-sm" />
            <div className="absolute top-56 -left-0.5 w-1 h-12 bg-[#2a2a2c] rounded-l-sm" />
            <div className="absolute top-44 -right-0.5 w-1 h-16 bg-[#2a2a2c] rounded-r-sm" />

            {/* Screen area */}
            <div className="absolute inset-1.5 rounded-[2.8rem] overflow-hidden bg-black">
              {/* Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 w-28 h-7 bg-black rounded-full" />

              {/* Dynamic Island overlay */}
              {showDynIsland && (
                <div
                  className="absolute top-3.5 left-1/2 -translate-x-1/2 z-40 w-[90%] animate-fade-in"
                >
                  <img
                    src="/screens/dynamic_island.png"
                    alt="Dynamic Island Notification"
                    className="w-full rounded-[1.5rem]"
                  />
                </div>
              )}

              {/* Screen crossfade */}
              {APP_SCREENS.map((screen, idx) => (
                <img
                  key={screen.id}
                  src={screen.src}
                  alt={screen.label}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-200"
                  style={{ opacity: idx === activeScreen ? 1 : 0 }}
                  draggable={false}
                />
              ))}

              {/* Top gloss */}
              <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-white/[0.025] to-transparent pointer-events-none z-10" />
            </div>
          </div>
        </div>

        {/* Right panel: info + tab switcher */}
        <div className="flex flex-col justify-between" style={{ maxWidth: '400px' }}>
          {/* Screen descriptor */}
          <div className="mb-10">
            <span className="text-xs font-mono text-[#adc6ff] uppercase tracking-[0.2em] font-bold block mb-3">
              App Screen — {APP_SCREENS[activeScreen].label}
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight min-h-[96px]">
              {APP_SCREENS[activeScreen].id === 'tune' && <>Master Tuning &<br />Equalizer Control</>}
              {APP_SCREENS[activeScreen].id === 'spatial' && <>Spatial Volume<br />Engine</>}
              {APP_SCREENS[activeScreen].id === 'analytics' && <>Live Acoustic<br />Analytics</>}
              {APP_SCREENS[activeScreen].id === 'settings' && <>Device Settings &<br />Management</>}
            </h3>
            <p className="text-gray-400 text-base leading-relaxed h-[72px]">
              {APP_SCREENS[activeScreen].desc}
            </p>
          </div>

          {/* Tab pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {APP_SCREENS.map((screen, idx) => (
              <button
                key={screen.id}
                onClick={() => handleTabClick(idx)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 spring-press ${
                  idx === activeScreen
                    ? 'bg-[#adc6ff] text-[#002e69] shadow-[0_0_20px_rgba(173,198,255,0.3)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {screen.label}
              </button>
            ))}
          </div>

          {/* Dynamic Island trigger */}
          <button
            onClick={handleToggleIsland}
            className={`self-start px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 spring-press ${
              showDynIsland
                ? 'bg-[#adc6ff]/15 border-[#adc6ff]/50 text-[#adc6ff]'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/25'
            }`}
          >
            {showDynIsland ? '✕ Hide' : '⊕ Preview'} Dynamic Island
          </button>
        </div>
      </div>
    </div>
  );
};

// Premium Text Reveal Title with dynamic fluid sizing
const PremiumTitle = () => {
  return (
    <h1 className="text-[16vw] sm:text-8xl md:text-[13rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-white uppercase relative drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] animate-title-reveal select-none will-change-transform">
      AURALIS
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent bg-[length:200%_100%] animate-shine bg-clip-text text-transparent pointer-events-none">
        AURALIS
      </span>
    </h1>
  );
};

// iPhone Widget Audio Interactive Visualizer (with smooth transitions)
const IPhoneVisualizer = ({ isPlaying, className = "bottom-12" }) => {
  const [heights, setHeights] = useState(Array(28).fill(15));

  useEffect(() => {
    let animationId;
    const animate = () => {
      setHeights(prev => prev.map((_, i) => {
        if (isPlaying) {
          return 15 + Math.sin(i * 0.35 + Date.now() * 0.01) * 60 + Math.random() * 22;
        } else {
          return 6 + Math.sin(i * 0.18 + Date.now() * 0.002) * 12 + Math.random() * 4;
        }
      }));
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <div className={`absolute left-6 right-6 h-20 flex items-end justify-between space-x-1 opacity-80 ${className}`}>
      {heights.map((h, i) => (
        <div 
          key={i} 
          className={`w-full rounded-t-sm transition-[height] duration-150 ease-out ${
            isPlaying 
              ? 'bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]' 
              : 'bg-gradient-to-t from-gray-700 to-gray-500'
          }`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

// Interactive iPhone Mockup Component
// Interactive iPhone Mockup Component
const PhoneMockupUI = ({ isPlaying, toggleSound, activeMode, setActiveMode, radarAngle, className = "" }) => {
  const [activeTab, setActiveTab] = useState('tune');
  const [eqValues, setEqValues] = useState([60, 50, 45, 60, 70]); // Bass, Low, Mid, High, Treble
  const [sourcePos, setSourcePos] = useState({ x: 0, y: -20 }); // Spatial panning coordinates
  const [isDragging, setIsDragging] = useState(false);
  
  // Device settings toggles
  const [autoPause, setAutoPause] = useState(true);
  const [headTracking, setHeadTracking] = useState(true);
  const [losslessLdac, setLosslessLdac] = useState(true);

  const radarRef = useRef(null);

  // Dragging sound source handler (Spatial Panner)
  const handleRadarInteraction = (e) => {
    if (!radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawX = clientX - centerX;
    const rawY = clientY - centerY;

    const distance = Math.sqrt(rawX * rawX + rawY * rawY);
    const maxRadius = 40; // constrain inside radar concentric circle bounds

    if (distance <= maxRadius) {
      setSourcePos({ x: rawX, y: rawY });
    } else {
      const angle = Math.atan2(rawY, rawX);
      setSourcePos({
        x: Math.cos(angle) * maxRadius,
        y: Math.sin(angle) * maxRadius
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleRadarInteraction(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleRadarInteraction(e);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // SVG EQ curve calculation
  const mapY = (val) => 35 - (val / 100) * 30;
  const pathD = `M 0,${mapY(eqValues[0])} C 25,${mapY(eqValues[1])} 50,${mapY(eqValues[2])} 75,${mapY(eqValues[3])} 100,${mapY(eqValues[4])}`;

  return (
    <div className={`w-full bg-[#171719] rounded-[3.5rem] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_-20px_80px_rgba(79,70,229,0.35),0_30px_60px_-20px_rgba(0,0,0,0.85)] relative group overflow-hidden ${className}`}>
      
      {/* Lens Glare sweep */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-y-full group-hover:translate-y-[-100%] transition-transform duration-[1500ms] ease-out pointer-events-none" />

      {/* Side Buttons */}
      <div className="absolute top-28 -left-0.5 w-1 h-8 bg-[#28282a] rounded-l-sm"></div>
      <div className="absolute top-44 -left-0.5 w-1 h-14 bg-[#28282a] rounded-l-sm"></div>
      <div className="absolute top-64 -left-0.5 w-1 h-14 bg-[#28282a] rounded-l-sm"></div>
      <div className="absolute top-52 -right-0.5 w-1 h-16 bg-[#28282a] rounded-r-sm"></div>
      
      {/* Phone Screen Area */}
      <div className="w-full h-full bg-[#000000] rounded-[3.1rem] relative overflow-hidden border border-white/5 flex flex-col font-sans">
        {/* Reflection gloss */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none z-30"></div>

        {/* Floating Dynamic Island Notification Pill (Matches stitch design layout) */}
        <div 
          onClick={toggleSound}
          className={`absolute left-1/2 -translate-x-1/2 bg-black rounded-full z-40 flex items-center justify-between px-3.5 shadow-island cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
            isPlaying 
              ? 'top-2.5 w-[92%] h-[125px] rounded-[2rem] border border-[#adc6ff]/20 bg-[#131313]/95 backdrop-blur-3xl px-4 py-3 rim-light-blue shadow-glow' 
              : 'top-3 w-[110px] h-8'
          }`}
        >
          {!isPlaying ? (
            // Compact Dynamic Island view
            <div className="w-full h-full flex items-center justify-end">
                <div className="w-3.5 h-3.5 rounded-full bg-[#0c0c0e] border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-blue-500/35 blur-[1px]"></div>
                </div>
            </div>
          ) : (
            // Expanded Dynamic Island Player notification (matches stitch code.html)
            <div className="w-full h-full flex flex-col justify-between animate-fade-in text-left select-none">
              {/* Top Row */}
              <div className="flex justify-between items-center w-full">
                {/* Left: Animated gradient pulsing sphere */}
                <div className="w-9 h-9 rounded-full spatial-sphere flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-[2px]"></div>
                </div>

                {/* Center: Info text */}
                <div className="flex flex-col items-center justify-center flex-grow px-2 text-center">
                  <h2 className="text-[10px] font-bold text-white tracking-tight font-sans">Auralis Space Pro</h2>
                  <span className="text-[7px] font-mono text-[#adc6ff] uppercase tracking-widest mt-0.5">Spatial Volume Engine</span>
                </div>

                {/* Right: Battery */}
                <div className="flex items-center space-x-1 flex-shrink-0 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  <span className="text-[8px] font-mono font-bold text-white">100%</span>
                  {/* Battery icon representation */}
                  <div className="w-3.5 h-2 border border-[#ffb595] rounded-sm p-[1px] flex items-center justify-start relative">
                    <div className="h-full w-full bg-[#ffb595] rounded-2xs" />
                    <div className="absolute right-[-2.5px] top-1/2 -translate-y-1/2 w-0.5 h-1 bg-[#ffb595] rounded-r-2xs" />
                  </div>
                </div>
              </div>

              {/* Bottom Controls Row */}
              <div className="flex justify-center items-center space-x-6 w-full pt-1.5 border-t border-white/5">
                {/* Skip Back */}
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="spring-press flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5 text-gray-300" />
                </button>
                
                {/* Play/Pause toggle */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleSound(); }}
                  className="spring-press flex items-center justify-center w-9 h-9 rounded-full bg-[#adc6ff] hover:bg-[#adc6ff]/90 transition-colors shadow-[0_0_15px_rgba(173,198,255,0.4)]"
                >
                  <Pause className="w-4 h-4 fill-[#002e69] stroke-[#002e69]" />
                </button>
                
                {/* Skip Forward */}
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="spring-press flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5 text-gray-300" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="absolute top-4 left-7 text-[10px] text-white/50 font-bold tracking-wide z-30 font-mono select-none">9:41</div>
        <div className="absolute top-4 right-6 flex items-center space-x-1.5 opacity-50 z-30 select-none">
            <Wifi className="w-3.5 h-3.5 text-white" />
            <Battery className="w-4 h-4 text-white" />
        </div>
        
        {/* Main Content Area */}
        <div className="pt-20 pb-16 px-5 h-full flex flex-col justify-between relative overflow-hidden select-none">
          
          <div className="flex-grow flex flex-col justify-start">
            {/* Header info display */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
              <div>
                <p className="text-[7px] text-gray-500 font-mono uppercase font-bold tracking-widest">
                  {activeTab === 'tune' && 'Tune Control'}
                  {activeTab === 'analytics' && 'Acoustic Analytics'}
                  {activeTab === 'studio' && 'Studio Engine'}
                  {activeTab === 'settings' && 'System Config'}
                </p>
                <h4 className="text-white text-xs font-bold mt-0.5 flex items-center font-sans">
                  Auralis Space Pro
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                </h4>
              </div>
              <div className="text-right flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                <span className="text-[8px] font-mono text-gray-400 font-bold">100%</span>
                <div className="w-3 h-1.5 border border-[#ffb595] rounded-sm p-[1px] flex items-center justify-start relative">
                  <div className="h-full w-full bg-[#ffb595] rounded-3xs" />
                </div>
              </div>
            </div>

            {/* SCREEN 1: Tune Control */}
            {activeTab === 'tune' && (
              <div className="flex-grow flex flex-col justify-between animate-fade-in text-left">
                {/* SVG EQ curve */}
                <div className="w-full h-16 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden p-2.5 flex flex-col justify-between">
                  <span className="text-[7px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Acoustic Curve</span>
                  <svg className="absolute inset-x-0 bottom-0 w-full h-10 text-indigo-500/10" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path 
                      d={pathD} 
                      fill="none" 
                      stroke="rgba(173,198,255,0.75)" 
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                {/* Tactile Equalizer Sliders */}
                <div className="grid grid-cols-5 gap-2.5 px-0.5 my-3">
                  {eqValues.map((val, idx) => {
                    const labels = ['BASS', 'LOW', 'MID', 'HIGH', 'TREB'];
                    return (
                      <div key={idx} className="flex flex-col items-center space-y-1.5">
                        <span className="text-[6px] font-mono text-gray-500 font-bold uppercase tracking-wider">{labels[idx]}</span>
                        <div className="h-20 w-3 bg-white/[0.03] border border-white/5 rounded-full relative flex items-end justify-center py-0.5">
                          {/* Active fill */}
                          <div 
                            className="w-full bg-indigo-500/30 rounded-full border-t border-indigo-400/50 pointer-events-none" 
                            style={{ height: `${val}%` }}
                          />
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={val} 
                            onChange={(e) => {
                              const newVal = parseInt(e.target.value);
                              setEqValues(prev => {
                                const next = [...prev];
                                next[idx] = newVal;
                                return next;
                              });
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                          />
                        </div>
                        <span className="text-[7px] font-mono text-indigo-400 font-bold">{val}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Acoustic Mode Switcher */}
                <div className="w-full">
                  <span className="text-[7px] font-mono text-gray-500 font-bold uppercase tracking-widest mb-1 block">Acoustic Control Mode</span>
                  <div className="grid grid-cols-3 gap-1 bg-black/40 border border-white/5 p-1 rounded-xl">
                    {['anc', 'transparency', 'off'].map((mode) => {
                      const isSelected = activeMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => setActiveMode(mode)}
                          className={`py-1 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all duration-300 ${
                            isSelected 
                              ? 'bg-[#adc6ff] text-[#002e69] shadow-[0_0_10px_rgba(173,198,255,0.25)]' 
                              : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: Audio Analytics */}
            {activeTab === 'analytics' && (
              <div className="flex-grow flex flex-col justify-between animate-fade-in text-left">
                <div className="space-y-3">
                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2">
                      <span className="text-[6px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Average Peak</span>
                      <span className="text-xs font-bold text-white font-mono">{isPlaying ? '-14.8 dB' : '-60.0 dB'}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2">
                      <span className="text-[6px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Dynamic Range</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{isPlaying ? '14.2 dB' : '0.0 dB'}</span>
                    </div>
                  </div>

                  {/* Telemetry Spectrum Analyzer */}
                  <div className="bg-[#131313]/50 border border-white/5 rounded-2xl p-3 h-28 relative overflow-hidden flex items-end justify-between space-x-[2px]">
                    <span className="absolute top-2 left-2.5 text-[6px] font-mono text-[#adc6ff] uppercase tracking-widest font-bold">Acoustic Spectrum</span>
                    {Array(18).fill(0).map((_, i) => {
                      const [h, setH] = useState(15);
                      useEffect(() => {
                        if (!isPlaying) {
                          setH(8);
                          return;
                        }
                        const timer = setInterval(() => {
                          setH(15 + Math.random() * 70);
                        }, 100 + i * 8);
                        return () => clearInterval(timer);
                      }, [isPlaying]);

                      return (
                        <div 
                          key={i} 
                          className="w-full rounded-t-[1px] transition-all duration-100 bg-gradient-to-t from-indigo-500/80 to-[#adc6ff] shadow-[0_0_8px_rgba(99,102,241,0.15)]"
                          style={{ height: `${h}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Codec Details */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                      <span className="text-[8px] text-white font-semibold">Lossless Audio Codec</span>
                    </div>
                    <span className="text-[8px] text-[#adc6ff] font-mono font-bold uppercase tracking-wider">LDAC @ 990 KBPS</span>
                  </div>
                </div>

                <div className="text-[7px] font-mono text-gray-500 uppercase tracking-widest text-center mt-2 border-t border-white/5 pt-1.5">
                  Pressure Level: {isPlaying ? '72 dBA' : '30 dBA (Ambient)'}
                </div>
              </div>
            )}

            {/* SCREEN 3: Studio Spatial Control */}
            {activeTab === 'studio' && (
              <div className="flex-grow flex flex-col justify-between animate-fade-in text-left">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] font-mono text-indigo-400 uppercase tracking-widest mb-2.5 font-bold">Drag dot to pan audio</span>
                  
                  {/* Draggable Panning radar grid */}
                  <div 
                    ref={radarRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    className="relative w-32 h-32 rounded-full border border-white/10 bg-black/40 flex items-center justify-center cursor-crosshair overflow-hidden shadow-inner"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:12px_12px] bg-center pointer-events-none" />
                    <div className="absolute w-full h-[1px] bg-white/5 pointer-events-none" />
                    <div className="absolute h-full w-[1px] bg-white/5 pointer-events-none" />

                    <div className="absolute w-[80%] h-[80%] rounded-full border border-indigo-500/5 pointer-events-none" />
                    <div className="absolute w-[50%] h-[50%] rounded-full border border-indigo-500/10 pointer-events-none" />
                    <div className="absolute w-5 h-5 rounded-full bg-white/5 border border-white/10 pointer-events-none flex items-center justify-center">
                      <span className="text-[5px] text-gray-500 font-bold uppercase">3D</span>
                    </div>

                    <span className="absolute top-1.5 text-[5px] font-mono text-gray-600 font-bold">FRONT</span>
                    <span className="absolute bottom-1.5 text-[5px] font-mono text-gray-600 font-bold">REAR</span>
                    <span className="absolute left-1.5 text-[5px] font-mono text-gray-600 font-bold">L</span>
                    <span className="absolute right-1.5 text-[5px] font-mono text-gray-600 font-bold">R</span>

                    {/* Drag indicator node */}
                    <div 
                      className="absolute w-3.5 h-3.5 rounded-full bg-indigo-500 border border-white shadow-[0_0_12px_rgba(99,102,241,0.9)] z-10 transition-all select-none duration-75"
                      style={{
                        transform: `translate(${sourcePos.x}px, ${sourcePos.y}px)`
                      }}
                    />

                    {isPlaying && (
                      <div 
                        className="absolute w-5 h-5 rounded-full border border-indigo-400/20 animate-ping pointer-events-none"
                        style={{
                          transform: `translate(${sourcePos.x}px, ${sourcePos.y}px)`
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 bg-white/[0.01] border border-white/5 rounded-xl p-2 font-mono text-[7px] text-gray-500 uppercase tracking-wider text-center">
                  <div>PAN X: <span className="text-[#adc6ff] font-bold">{Math.round(sourcePos.x)}</span></div>
                  <div>PAN Y: <span className="text-[#adc6ff] font-bold">{Math.round(sourcePos.y * -1)}</span></div>
                </div>
              </div>
            )}

            {/* SCREEN 4: Settings Profile */}
            {activeTab === 'settings' && (
              <div className="flex-grow flex flex-col justify-start space-y-3 animate-fade-in text-left">
                {/* Meta details list */}
                <div className="bg-[#131313]/60 border border-white/5 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-gray-500 font-mono uppercase font-bold">Model</span>
                    <span className="text-white font-semibold">Auralis Pro</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-gray-500 font-mono uppercase font-bold">Firmware</span>
                    <span className="text-white font-semibold font-mono">v1.4.5</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-gray-500 font-mono uppercase font-bold">Hardware</span>
                    <span className="text-[#adc6ff] font-semibold font-mono">AUR-PRO-TITANIUM</span>
                  </div>
                </div>

                {/* Settings Toggle Switches */}
                <div className="space-y-1.5">
                  {/* Auto pause switch */}
                  <div 
                    onClick={() => setAutoPause(!autoPause)}
                    className="flex justify-between items-center bg-[#131313]/40 hover:bg-[#131313]/80 border border-white/5 rounded-xl p-2 cursor-pointer transition-colors"
                  >
                    <div>
                      <h5 className="text-[8px] text-white font-bold tracking-tight">Auto-Pause Sensor</h5>
                      <p className="text-[5px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">Pause playback when removed</p>
                    </div>
                    <div className={`w-6 h-3 rounded-full p-[1px] flex items-center transition-colors duration-300 ${autoPause ? 'bg-[#adc6ff]' : 'bg-gray-800'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-[#002e69] transition-transform duration-300 ${autoPause ? 'translate-x-3.2' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Head Tracking switch */}
                  <div 
                    onClick={() => setHeadTracking(!headTracking)}
                    className="flex justify-between items-center bg-[#131313]/40 hover:bg-[#131313]/80 border border-white/5 rounded-xl p-2 cursor-pointer transition-colors"
                  >
                    <div>
                      <h5 className="text-[8px] text-white font-bold tracking-tight">Dynamic Head Tracking</h5>
                      <p className="text-[5px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">Spatial Audio locks to position</p>
                    </div>
                    <div className={`w-6 h-3 rounded-full p-[1px] flex items-center transition-colors duration-300 ${headTracking ? 'bg-[#adc6ff]' : 'bg-gray-800'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-[#002e69] transition-transform duration-300 ${headTracking ? 'translate-x-3.2' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Lossless LDAC switch */}
                  <div 
                    onClick={() => setLosslessLdac(!losslessLdac)}
                    className="flex justify-between items-center bg-[#131313]/40 hover:bg-[#131313]/80 border border-white/5 rounded-xl p-2 cursor-pointer transition-colors"
                  >
                    <div>
                      <h5 className="text-[8px] text-white font-bold tracking-tight">Lossless LDAC Codec</h5>
                      <p className="text-[5px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">High bit-rate up to 990 kbps</p>
                    </div>
                    <div className={`w-6 h-3 rounded-full p-[1px] flex items-center transition-colors duration-300 ${losslessLdac ? 'bg-[#adc6ff]' : 'bg-gray-800'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-[#002e69] transition-transform duration-300 ${losslessLdac ? 'translate-x-3.2' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Dynamic Visualizer overlay above tabs */}
        {activeTab !== 'analytics' && (
          <IPhoneVisualizer isPlaying={isPlaying} className="bottom-[58px]" />
        )}

        {/* Reusable Bottom Tab Bar (Obsidian Flux Design) */}
        <div className="absolute bottom-2 left-2 right-2 h-11 bg-black/80 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-around px-1 z-35">
          <button 
            onClick={() => setActiveTab('tune')}
            className={`flex flex-col items-center justify-center w-10 h-8 rounded-lg transition-all ${
              activeTab === 'tune' ? 'text-[#adc6ff] bg-white/5' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[5px] font-mono mt-0.5 uppercase tracking-wider">Tune</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center w-10 h-8 rounded-lg transition-all ${
              activeTab === 'analytics' ? 'text-[#adc6ff] bg-white/5' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[5px] font-mono mt-0.5 uppercase tracking-wider">Stats</span>
          </button>

          <button 
            onClick={() => setActiveTab('studio')}
            className={`flex flex-col items-center justify-center w-10 h-8 rounded-lg transition-all ${
              activeTab === 'studio' ? 'text-[#adc6ff] bg-white/5' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[5px] font-mono mt-0.5 uppercase tracking-wider">Studio</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-10 h-8 rounded-lg transition-all ${
              activeTab === 'settings' ? 'text-[#adc6ff] bg-white/5' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[5px] font-mono mt-0.5 uppercase tracking-wider">Device</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Scroll Fade Wrapper for Bento Grid Rows ---
const ScrollFadeRow = ({ children }) => {
  const rowRef = useRef(null);
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!rowRef.current) return;
      const rect = rowRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const rowCenter = rect.top + rect.height / 2;
      // Calculate distance from center, normalizing against half the viewport height
      const dist = Math.abs(viewportCenter - rowCenter);
      const maxDist = window.innerHeight / 1.5;
      
      const newFocus = Math.max(0, Math.min(1, 1 - (dist / maxDist)));
      setFocus(newFocus);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = 0.3 + (focus * 0.7);
  const scale = 0.95 + (focus * 0.05);
  const blur = (1 - focus) * 5;

  return (
    <div 
      ref={rowRef} 
      style={{ 
        opacity, 
        transform: `scale(${scale})`, 
        filter: `blur(${blur}px)`,
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out, filter 0.2s ease-out' 
      }} 
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 auto-rows-[420px]"
    >
      {children}
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState('anc');
  const [radarAngle, setRadarAngle] = useState(0);

  const scrollY = useWindowScrollY();
  const designRef = useRef(null);
  const scrollProgress = useElementScrollProgress(designRef);
  const audioRef = useRef(null);

  // Hero fan scroll progress: fan starts opening at scrollY=0 and fully opens by scrollY=700
  // This keeps the phones visible and in-frame the entire time
  const heroFanRef = useRef(null);
  const heroScrollP = Math.max(0, Math.min(1, scrollY / 700));




  const toggleSound = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const control = playSpatialSynth();
      if (control) {
        audioRef.current = control;
        setIsPlaying(true);
      }
    }
  };

  // Lock scroll on open modal
  useEffect(() => {
    if (isMenuOpen || isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen, isCheckoutOpen]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.stop();
      }
    };
  }, []);

  // Animate the radar dial sweeps
  useEffect(() => {
    if (isPlaying) {
      let frameId;
      const step = () => {
        setRadarAngle(prev => (prev + 2.2) % 360);
        frameId = requestAnimationFrame(step);
      };
      step();
      return () => cancelAnimationFrame(frameId);
    } else {
      setRadarAngle(0);
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-[#040405] text-[#C8CCD4] font-sans overflow-x-clip selection:bg-[#ADC6FF]/25">
      
      {/* Dynamic Floating Particles Background */}
      <HeroCanvasBackground />

      {/* Ambient Glows with slow drifting motion */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-10 animate-drift-1" style={{ background: 'radial-gradient(circle, rgba(173,198,255,0.4) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[65vw] h-[65vw] rounded-full opacity-8 animate-drift-2" style={{ background: 'radial-gradient(circle, rgba(200,204,212,0.3) 0%, transparent 70%)', filter: 'blur(130px)' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold tracking-widest" style={{ color: '#adc6ff', fontFamily: 'Inter, sans-serif' }}>AURALIS</div>
          </div>
          
          <div className="hidden md:flex items-center space-x-12 text-sm font-semibold tracking-wider text-gray-500">
            <a href="#design" className="nav-link hover:text-white transition-colors">Design</a>
            <a href="#features" className="nav-link hover:text-white transition-colors">Features</a>
            <a href="#tech" className="nav-link hover:text-white transition-colors">Technology</a>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="hidden md:flex items-center px-6 py-2.5 border text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 transition-all duration-300 ease-out spring-press"
              style={{ background: 'rgba(173,198,255,0.08)', borderColor: 'rgba(173,198,255,0.3)', color: '#adc6ff' }}
            >
              Pre-order
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[60] bg-[#050508] transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex justify-end">
          <button onClick={() => setIsMenuOpen(false)}>
            <X className="w-8 h-8 text-[#C8CCD4]" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-8 text-3xl font-medium tracking-tight">
          <a href="#design" onClick={() => setIsMenuOpen(false)} className="hover:text-[#ADC6FF] transition-colors">Design</a>
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-[#ADC6FF] transition-colors">Features</a>
          <a href="#tech" onClick={() => setIsMenuOpen(false)} className="hover:text-[#ADC6FF] transition-colors">Technology</a>
          <button 
            onClick={() => { setIsMenuOpen(false); setIsCheckoutOpen(true); }}
            className="mt-8 px-8 py-4 bg-[#ADC6FF] text-[#040405] rounded-full text-xl hover:bg-[#ADC6FF]/90 font-bold"
          >
            Pre-order Now
          </button>
        </div>
      </div>

      {/* ══════════ HERO SECTION — Sticky Scroll Fan ══════════ */}
      {/* The outer section is exactly 100vh + 700px tall. The inner .sticky div 
          pins at top:0 and stays in view while the user scrolls the first 700px, 
          which precisely matches the scrollY distance needed to fan the phones out. */}
      <section
        ref={heroFanRef}
        className="relative bg-[#040405]"
        style={{ height: 'calc(100vh + 700px)' }}
      >
        <div className="sticky top-0 h-screen flex flex-col overflow-hidden">

          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(173,198,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(173,198,255,0.018) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          {/* Ambient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '900px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(173,198,255,0.12) 0%, transparent 70%)',
              filter: 'blur(70px)',
            }}
          />

          {/* ── Text block ── */}
          <div className="relative z-10 text-center pt-24 md:pt-28 px-4 flex flex-col items-center">
            <FadeIn>
              <p className="text-[10px] md:text-[11px] font-mono text-[#adc6ff] font-bold tracking-[0.32em] uppercase mb-4">
                Spatial audio meets pure titanium
              </p>
            </FadeIn>

            <div className="flex items-center justify-center min-h-[140px] md:min-h-[180px] overflow-visible py-4">
              <PremiumTitle />
            </div>

            <FadeIn delay={200}>
              <p className="text-gray-500 text-sm md:text-base max-w-md mt-2 leading-relaxed">
                Four modes. One headset. Total acoustic control.
              </p>
            </FadeIn>

            {/* Scroll hint */}
            <div
              className="mt-5 flex flex-col items-center gap-1.5"
              style={{ opacity: heroScrollP < 0.05 ? 1 : 0, transition: 'opacity 0.4s ease' }}
            >
              <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Scroll to explore</span>
              <div className="w-px h-8 bg-gradient-to-b from-gray-700 to-transparent animate-pulse" />
            </div>
          </div>

          {/* ── Phone fan ── */}
          <div className="relative flex-1 flex items-center justify-center z-10">
            <HeroPhoneFan
              isPlaying={isPlaying}
              toggleSound={toggleSound}
              scrollP={heroScrollP}
            />
          </div>

          {/* ── Ticker tape ── */}
          <div
            className="absolute bottom-0 w-full py-3 overflow-hidden z-30 border-t border-white/[0.04]"
            style={{ background: 'rgba(173,198,255,0.05)', backdropFilter: 'blur(8px)' }}
          >
            <div className="animate-marquee whitespace-nowrap flex items-center text-[#adc6ff]/50 font-bold text-[9px] tracking-[0.28em] uppercase will-change-transform">
              {[...Array(2)].map((_, ri) => (
                <div key={ri} className="flex">
                  {['Experience the next generation of audio','Pure titanium construction','Lossless zero latency','Obsidian Flux design system','Spatial Volume Engine'].map((t) => (
                    <span key={t} className="mx-8 flex items-center">
                      <span className="w-1 h-1 rounded-full bg-[#adc6ff]/30 mr-3" />
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Scroll Storytelling Section (Exploded Schematic Assembly) */}
      <section ref={designRef} id="design" className="relative bg-[#050508] py-32 md:py-44 h-[200vh]">
        <div className="sticky top-0 h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center h-full">
              
              <div className="space-y-36 py-16">
                <FadeIn>
                  <span className="text-xs text-[#ADC6FF] font-medium uppercase tracking-[0.25em]">Acoustic Engineering</span>
                  <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-6 text-white leading-tight">
                    Machined from<br />aerospace-grade titanium.
                  </h3>
                  <p className="text-base text-gray-400 leading-snug max-w-lg">
                    Every curve is mathematically calculated for optimal acoustic resonance. The ultra-light titanium exoskeleton provides unmatched durability while feeling weightless.
                  </p>
                </FadeIn>

                <FadeIn>
                  <span className="text-xs text-[#ADC6FF] font-medium uppercase tracking-[0.25em]">Precision Sound</span>
                  <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-6 text-white leading-tight">
                    Custom-built<br />neodymium drivers.
                  </h3>
                  <p className="text-base text-gray-400 leading-snug max-w-lg">
                    Experience sound with absolute clarity. Our newly designed 40mm drivers deliver deep, distortion-free bass and crystalline highs.
                  </p>
                </FadeIn>
              </div>

              {/* Exploded Blueprint Assembly */}
              <div className="h-[50vh] flex items-center justify-center">
                <BlueprintAssembly progress={scrollProgress} />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features (Perfectly Balanced 3-Column Rows) */}
      <section id="features" className="py-32 bg-[#050508] relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ADC6FF]/5 rounded-full blur-[130px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-20 text-center text-white">
              The details make<br />the design.
            </h2>
          </FadeIn>

          <div className="flex flex-col">
            
            {/* ROW 1: Span 2 + Span 1 */}
            <ScrollFadeRow>
              {/* Spotlight Card: Spatial Audio */}
              <SpotlightCard wrapperClass="md:col-span-2 relative" delay={100}>
                {({ isHovered }) => (
                  <>
                    <CanvasWaves isHovered={isHovered} />
                    
                    <div className="absolute top-10 right-10 p-5 bg-[#050508]/80 rounded-full border border-[#ADC6FF]/20 z-10 shadow-[0_0_30px_rgba(173,198,255,0.2)]">
                      <Volume2 className="w-8 h-8 text-[#ADC6FF] animate-pulse" />
                    </div>

                    <div className="relative z-10 mt-auto pointer-events-none">
                      <h3 className="text-3xl font-bold mb-3 text-white">Adaptive Spatial Audio</h3>
                      <p className="text-gray-400 text-base max-w-md leading-snug">Dynamic head tracking creates a three-dimensional listening experience that surrounds you entirely.</p>
                    </div>
                  </>
                )}
              </SpotlightCard>

              {/* Spotlight Card: Battery */}
              <SpotlightCard wrapperClass="relative" delay={200}>
                {({ isHovered }) => (
                  <>
                    <BatteryFeature isHovered={isHovered} />
                    <div className="relative z-10 mt-auto pointer-events-none">
                      <h3 className="text-2xl font-semibold mb-2 text-white">48-Hour Battery</h3>
                      <p className="text-gray-400 text-sm">Hover cell to trigger rapid charge simulation.</p>
                    </div>
                  </>
                )}
              </SpotlightCard>
            </ScrollFadeRow>

            {/* ROW 2: Span 1 + Span 2 */}
            <ScrollFadeRow>
              {/* Spotlight Card: Wireless */}
              <SpotlightCard wrapperClass="relative" delay={300}>
                <div className="absolute top-10 right-10 p-4 bg-white/5 rounded-full border border-white/5 group-hover:border-[#ADC6FF]/30 transition-all duration-500 z-10">
                  <Wifi className="w-7 h-7 text-gray-500 group-hover:text-[#ADC6FF] transition-colors duration-500" />
                </div>
                
                <div className="mt-auto relative z-10 pointer-events-none">
                  <h3 className="text-2xl font-semibold mb-2 text-white">Lossless Wireless</h3>
                  <p className="text-gray-400 text-sm">Zero latency. Pure studio quality sound without the constraints of wires.</p>
                </div>
              </SpotlightCard>

              {/* Spotlight Card: Ecosystem */}
              <SpotlightCard wrapperClass="md:col-span-2 relative" delay={400}>
                <EcosystemFeature />
                <div className="mt-auto relative z-10 pointer-events-none w-full md:w-1/2">
                  <h3 className="text-3xl font-semibold mb-3 text-white">Seamless Ecosystem</h3>
                  <p className="text-gray-400 text-base leading-snug">
                    Switch listening states seamlessly across your devices. Pushed to your ears instantly.
                  </p>
                </div>
              </SpotlightCard>
            </ScrollFadeRow>

            {/* ROW 3 (Balancing Row): Span 1 + Span 1 + Span 1 */}
            <ScrollFadeRow>
              {/* Spotlight Card: Titanium Shell */}
              <SpotlightCard wrapperClass="relative" delay={500}>
                {({ isHovered }) => (
                  <>
                    <TitaniumFeature isHovered={isHovered} />
                    <div className="relative z-10 mt-auto pointer-events-none">
                      <h3 className="text-2xl font-semibold mb-2 text-white">Titanium Shell</h3>
                      <p className="text-gray-400 text-sm">Aerospace-grade exoskeleton provides weightless, robust shielding.</p>
                    </div>
                  </>
                )}
              </SpotlightCard>

              {/* Spotlight Card: Smart ANC */}
              <SpotlightCard wrapperClass="relative" delay={600}>
                {({ isHovered }) => (
                  <>
                    <ANCFeature isHovered={isHovered} />
                    <div className="relative z-10 mt-auto pointer-events-none">
                      <h3 className="text-2xl font-semibold mb-2 text-white">Smart ANC</h3>
                      <p className="text-gray-400 text-sm">Hover card to phase-invert and cancel ambient noise waves.</p>
                    </div>
                  </>
                )}
              </SpotlightCard>

              {/* Spotlight Card: Nano H1 Audio Core */}
              <SpotlightCard wrapperClass="relative" delay={700}>
                {({ isHovered }) => (
                  <>
                    <ChipFeature isHovered={isHovered} />
                    <div className="relative z-10 mt-auto pointer-events-none">
                      <h3 className="text-2xl font-semibold mb-2 text-white">Nano H1 Core</h3>
                      <p className="text-gray-400 text-sm">Low-latency chipset handles dual-core ANC and lossless streaming.</p>
                    </div>
                  </>
                )}
              </SpotlightCard>
            </ScrollFadeRow>

          </div>
        </div>
      </section>

      {/* App Prototype Section — All screens interactive */}
      <section id="tech" className="py-24 md:py-36 relative border-t border-white/5" style={{ background: '#040405' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <span className="text-[11px] font-mono text-[#adc6ff] font-bold uppercase tracking-[0.25em] block text-center mb-3">Auralis App — Live Prototype</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-center text-white">
              Every screen.<br />Engineered to perform.
            </h2>
            <p className="text-gray-500 text-center text-sm md:text-base mb-20 max-w-xl mx-auto">
              Browse all four app screens. Tap the tabs to switch. Preview the Dynamic Island live notification overlay.
            </p>
          </FadeIn>

          <FadeIn delay={150}>
            <AppPrototype />
          </FadeIn>

          {/* Engineering Specs below prototype */}
          <div className="mt-24 border-t border-white/5 pt-16">
            <FadeIn delay={200}>
              <h3 className="text-2xl font-extrabold tracking-tight text-white mb-8 text-center">Engineering Specifications</h3>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/5 border border-white/5 rounded-3xl overflow-hidden">
              {[
                { name: "Transducer Unit", value: "40mm Custom Neodymium" },
                { name: "Frequency Range", value: "4Hz – 45,000Hz Hi-Res" },
                { name: "Latency", value: "< 4.8ms Ultra-Link Lossless" },
                { name: "ANC", value: "Dual-Core Hybrid (−48dB)" },
                { name: "Chassis", value: "Aerospace Titanium" },
                { name: "Sensors", value: "Dual-Axis Gyro Head Tracking" },
              ].map((spec, i) => (
                <div key={i} className="py-5 px-8 flex justify-between items-center border-b border-white/5 last:border-b-0">
                  <span className="text-gray-500 text-sm font-mono uppercase tracking-wider">{spec.name}</span>
                  <span className="text-white text-sm font-semibold text-right ml-4">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-44 text-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #040405, #050508)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(173,198,255,0.06) 0%, transparent 60%)' }}></div>
        <FadeIn>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">Ready to listen?</h2>
          <button onClick={() => setIsCheckoutOpen(true)} className="px-10 py-5 rounded-full text-sm font-bold uppercase tracking-wider hover:scale-105 transition-all duration-300 spring-press" style={{ background: 'rgba(173,198,255,0.1)', border: '1px solid rgba(173,198,255,0.35)', color: '#adc6ff', boxShadow: '0 0 40px rgba(173,198,255,0.12)' }}>
            Pre-order Auralis
          </button>
        </FadeIn>
      </section>

      {/* Checkout Modal */}
      <CheckoutFlow isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}

// --- Checkout Flow Component ---

const CheckoutFlow = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Obsidian');
  const [isProcessing, setIsProcessing] = useState(false);

  const colors = [
    { name: 'Obsidian', hex: '#111111', img: '/obsidian.png' },
    { name: 'Starlight', hex: '#E6E4DD', img: '/starlight.png' },
    { name: 'Titanium', hex: '#878681', img: '/titanium.png' },
  ];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#050508] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all animate-fade-in">
        
        {/* Left Side: Product Showcase */}
        <div className="md:w-1/2 bg-[#040405] p-10 flex flex-col items-center justify-center relative border-r border-white/5 min-h-[300px] md:min-h-[480px]">
           <button onClick={onClose} className="absolute top-6 left-6 text-[#C8CCD4] hover:text-[#ADC6FF] md:hidden">
            <X className="w-6 h-6" />
          </button>
          
          {/* Dynamic Color Product Rendering */}
          <div className="relative w-64 h-64 flex items-center justify-center transition-all duration-700 ease-in-out">
            <img 
              src={`/${selectedColor.toLowerCase()}.png`} 
              alt={`Auralis ${selectedColor}`}
              className="w-[85%] h-auto max-h-[85%] object-contain drop-shadow-2xl z-10"
              key={selectedColor}
            />
          </div>
          
          <div className="mt-6 text-center z-10">
            <div className="mb-8 border-b border-white/5 pb-8">
              <h4 className="text-3xl font-extrabold tracking-tight">AURALIS</h4>
              <p className="text-gray-400 text-sm mt-1">Spatial Audio Pro Edition</p>
            </div>
            <p className="text-[#ADC6FF] font-medium text-xs mt-1 uppercase tracking-widest">{selectedColor} Titanium Finish</p>
            <p className="text-xl font-bold mt-3 text-white/90 font-mono">$499.00</p>
          </div>
        </div>

        {/* Right Side: Step Flow */}
        <div className="md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center min-h-[400px] bg-[#050508]">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-[#C8CCD4] hidden md:block transition-colors">
            <X className="w-6 h-6" />
          </button>

          <div className="flex-1 flex flex-col justify-center">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                <h3 className="text-2xl font-bold mb-6 text-white">Choose Finish</h3>
                <div className="space-y-4">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-full flex items-center p-4 rounded-2xl border transition-all ${
                        selectedColor === color.name 
                          ? 'border-[#ADC6FF] bg-[#ADC6FF]/5 shadow-[0_0_15px_rgba(173,198,255,0.15)]' 
                          : 'border-[#C8CCD4]/5 hover:border-[#C8CCD4]/20 hover:bg-[#C8CCD4]/5'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-full mr-4 border border-white/20 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-semibold text-base text-white/90">{color.name} Finish</span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full mt-8 py-4 bg-[#C8CCD4] text-[#040405] hover:bg-white rounded-full font-bold uppercase tracking-wider text-xs transition-colors shadow-lg"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                <h3 className="text-2xl font-bold mb-6 text-white">Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-2xl border border-[#C8CCD4]/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-3 text-[#ADC6FF]" />
                      <div className="flex-1 ml-3">
                        <p className="font-bold text-sm text-white">Auralis Titanium</p>
                        <p className="text-xs text-[#C8CCD4]/50 mt-0.5">Ships in 2-3 weeks</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-white font-mono">$499.00</p>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#ADC6FF] hover:bg-[#ADC6FF]/80 text-[#040405] rounded-full font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center disabled:opacity-50 shadow-[0_0_20px_rgba(173,198,255,0.35)]"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-[#040405]/30 border-t-[#040405] rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay $499.00
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="w-full mt-4 text-xs font-semibold text-[#C8CCD4]/50 hover:text-[#ADC6FF] uppercase tracking-wider transition-colors text-center"
                  disabled={isProcessing}
                >
                  Back
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" className="animate-draw-checkmark" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Pre-order Confirmed</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                  We'll contact you when your {selectedColor} Auralis is ready to ship. Thank you.
                </p>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider transition-colors text-white"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Custom Hooks helper for scrollY values inside JSX ---
const useScrollProgress = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY };
};
