'use client';

import dynamic from 'next/dynamic';
import { VisualizationMode } from '@/types/timer';
import CubeNet2D from './CubeNet2D';

// Dynamic import TwistyPlayer to avoid SSR issues
const TwistyPlayer = dynamic(() => import('@/components/TwistyPlayer'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '12px'
    }}>
      Loading...
    </div>
  ),
});

interface ScrambleVisualizationProps {
  scramble: string;
  mode: VisualizationMode;
}

export default function ScrambleVisualization({
  scramble,
  mode,
}: ScrambleVisualizationProps) {
  if (mode === 'net2d') {
    return <CubeNet2D scramble={scramble} />;
  }

  // 3D mode using TwistyPlayer
  return (
    <TwistyPlayer
      alg=""
      setup={scramble}
      visualization="3D"
      controlPanel="none"
      background="none"
      hintFacelets="none"
      experimentalStickering="full"
    />
  );
}
