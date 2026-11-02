import React from 'react';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { CrosshairHUD } from './components/ui/CrosshairHUD';
import { KnowledgePanel } from './components/ui/KnowledgePanel';
import { MachineControlOverlay } from './components/ui/MachineControlOverlay';
import { VectorDesignModal } from './components/ui/VectorDesignModal';
import { SpecimenInspectionModal } from './components/ui/SpecimenInspectionModal';
import { LoadingScreen } from './components/ui/LoadingScreen';

export function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-lab-dark select-none">
      {/* 3D WebGL Canvas Layer */}
      <CanvasContainer />

      {/* 2D UI & HUD Overlay Layer */}
      <CrosshairHUD />

      {/* Inspection Sidebar Knowledge Panel (Direct root mount for uninterrupted scroll & tab clicks) */}
      <KnowledgePanel />

      {/* Interactive Machine Open/Close, Material Placement & Cut/Engrave Dock */}
      <MachineControlOverlay />

      {/* Interactive Vector CAD Design Studio Modal */}
      <VectorDesignModal />

      {/* Interactive Finished Specimen 3D Inspection Modal */}
      <SpecimenInspectionModal />

      {/* Loading Progress Screen */}
      <LoadingScreen />
    </main>
  );
}

export default App;
