import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import '@google/model-viewer';
import { ArrowLeft, Camera } from 'lucide-react';

const ShuBoomAR = () => {
    const [searchParams] = useSearchParams();
    const modelUrl = searchParams.get('model') || "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        // Just explicit check simulation
        setPermissionGranted(true);
    }, []);

    return (
        <div className="h-screen w-full bg-black relative font-montserrat">
            <Link to="/game/shuboom/collection" className="absolute top-4 left-4 z-10 text-white bg-black/50 p-3 rounded-full backdrop-blur-md">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <model-viewer
                src={modelUrl}
                ios-src=""
                poster="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=60&w=400"
                alt="A 3D model"
                shadow-intensity="1"
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                style={{ width: '100%', height: '100%' }}
            >
                <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                    <button className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg pointer-events-auto flex items-center gap-2 active:scale-95 transition-transform font-montserrat">
                        <Camera className="w-5 h-5" /> Снять фото
                    </button>
                </div>

                <button slot="ar-button" className="absolute bottom-24 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg pointer-events-auto">
                    Activate AR
                </button>
            </model-viewer>

            <div className="absolute top-4 right-4 z-10">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">AR Mode</span>
            </div>
        </div>
    );
};

export default ShuBoomAR;
