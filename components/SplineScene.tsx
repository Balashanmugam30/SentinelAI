'use client';

import dynamic from 'next/dynamic';

import { motion } from 'framer-motion';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <SplineLoader />,
});

function SplineLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[300px]">
      <motion.div
        className="flex flex-col items-center gap-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-12 w-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <span className="text-xs text-white/30">Loading 3D Scene...</span>
      </motion.div>
    </div>
  );
}

interface SplineSceneProps {
  scene: string;
  className?: string;
  style?: React.CSSProperties;
  isSpeaking?: boolean;
}

export default function SplineScene({ scene, className = '', style, isSpeaking = false }: SplineSceneProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      <Spline scene={scene} style={{ width: '100%', height: '100%' }} />
      {/* Speaking glow overlay */}
      {isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.6, 0],
            boxShadow: [
              'inset 0 0 30px rgba(99,102,241,0.0), 0 0 20px rgba(99,102,241,0.0)',
              'inset 0 0 30px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.2)',
              'inset 0 0 20px rgba(34,211,238,0.1), 0 0 25px rgba(34,211,238,0.15)',
              'inset 0 0 30px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.2)',
              'inset 0 0 30px rgba(99,102,241,0.0), 0 0 20px rgba(99,102,241,0.0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
