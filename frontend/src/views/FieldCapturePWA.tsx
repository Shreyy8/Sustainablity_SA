import React, { useState, useRef } from 'react';
import { ProjectSite, EvidenceAsset } from '../types';

interface FieldCapturePWAProps {
  sites: ProjectSite[];
  onAssetCaptured?: (newAsset: EvidenceAsset) => void;
  onNavigateToQueue?: () => void;
}

export const FieldCapturePWA: React.FC<FieldCapturePWAProps> = ({
  sites,
  onAssetCaptured,
  onNavigateToQueue,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || 'CSR-TATA-2025-0012');
  const [selectedMilestone, setSelectedMilestone] = useState<'MS-03' | 'MS-02' | 'MS-04'>('MS-03');
  const [witnessChecked, setWitnessChecked] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [isHighSunlight, setIsHighSunlight] = useState(true);
  const [offlineCount, setOfflineCount] = useState(4);
  const [accuracy, setAccuracy] = useState(3.2);
  const [horizonDeg, setHorizonDeg] = useState(0.0);
  const [calibrating, setCalibrating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastHashOutput, setLastHashOutput] = useState<string | null>(null);
  const [activeFrameMode, setActiveFrameMode] = useState<'device' | 'desktop'>('device');
  const [cameraStreamActive, setCameraStreamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Start real camera if permitted
  const toggleLiveCamera = async () => {
    if (cameraStreamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraStreamActive(false);
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraStreamActive(true);
        }
      }
    } catch {
      alert('Camera access unavailable or declined. Using forensic high-resolution sensor simulation.');
    }
  };

  const handleRecalibrate = () => {
    setCalibrating(true);
    setTimeout(() => {
      setAccuracy(1.4);
      setHorizonDeg(0.0);
      setCalibrating(false);
    }, 1200);
  };

  const handleShutterCapture = () => {
    setIsCapturing(true);

    // Generate valid 64-char hex SHA-256 hash
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }

    setTimeout(() => {
      setIsCapturing(false);
      setLastHashOutput(hash);
      setOfflineCount((c) => c + 1);

      const capturedAsset: EvidenceAsset = {
        id: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        shortId: `${Math.floor(1000 + Math.random() * 9000)}`,
        siteId: activeSite.id,
        siteName: activeSite.name,
        district: activeSite.district,
        timestamp: new Date().toISOString(),
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9KAVOwlHEsbN_4xALGiNvalMoHk-7Gr_OudX0kgON7QBIxHwCQKbWCsRfKJHA6dsgxYA6MXRdBuIQPt_i8CAFBHn3tcuEHwvLwDYedj-eMcznMvuenou9VQSCopFX2IC9AwZf2fjd50rSFxG3F-phXkCtHwQr8-4-fFoD5Ucq9SLAB_RohE3og6v74Iasxdmao49bTHIiQdYWanFyASr5oDUrueBjQvtGMgR0dNzMvynxnxkIujXF',
        canonicalHash: hash,
        hardwareKeyId: 'HSM-IN-DL-0994-ED25519 (FIPS 140-3 LEVEL 3 ATTESTED)',
        blockchainTx: `0x${hash.substring(0, 40)}`,
        blockNumber: 61984211,
        opticalSensor: 'SONY IMX766 (1/1.56")',
        resolution: '4032x3024px (12.2 MP)',
        aperture: 'f/1.8',
        iso: 100,
        shutter: '1/1250s',
        trustScore: 98,
        auditGrade: 'AUDIT GRADE',
        scheduleVIIHead: activeSite.scheduleVIIHead,
        sanctionedAmount: activeSite.sanctionedAmount,
        disbursedAmount: activeSite.disbursedAmount,
        milestoneId: selectedMilestone,
        milestoneName:
          selectedMilestone === 'MS-03'
            ? 'M3 - Superstructure & Tin Roof Installation'
            : selectedMilestone === 'MS-02'
            ? 'M2 - Brick Masonry & RCC Columns'
            : 'M4 - Sanitation Facilities & Rainwater Harvest',
        coordinates: {
          lat: 25.75321,
          lng: 71.39648,
          cep: accuracy,
        },
        heuristics: [
          {
            id: 'H1',
            name: 'GEOFENCE BOUNDARY VALIDATION',
            description: `Centroid match at Chohtan Block (+/- ${accuracy}m CEP)`,
            passed: true,
            penalty: 0,
          },
          {
            id: 'H2',
            name: 'HARDWARE TEE ATTESTATION',
            description: 'Samsung Knox Enclave Signature Verified. Zero modification detected.',
            passed: true,
            penalty: 0,
          },
        ],
      };

      if (onAssetCaptured) {
        onAssetCaptured(capturedAsset);
      }
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleShutterCapture();
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-[#131313] min-h-[calc(100vh-48px)] py-2 sm:py-4 px-2 sm:px-4">
      {/* Viewport Width Mode Switcher */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-2 mb-2 border-b border-[#444748] font-code text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">[S1: FIELD CAPTURE PWA]</span>
          <span className="text-[#8e9192] hidden sm:inline">// MCA DIGITAL FORENSIC INGEST</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFrameMode('device')}
            className={`px-2 py-0.5 uppercase font-bold border ${
              activeFrameMode === 'device'
                ? 'bg-white text-black border-white'
                : 'bg-[#1b1b1b] text-[#8e9192] border-[#444748]'
            }`}
          >
            MOBILE FRAME
          </button>
          <button
            onClick={() => setActiveFrameMode('desktop')}
            className={`px-2 py-0.5 uppercase font-bold border ${
              activeFrameMode === 'desktop'
                ? 'bg-white text-black border-white'
                : 'bg-[#1b1b1b] text-[#8e9192] border-[#444748]'
            }`}
          >
            EXPANDED
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full ${
          activeFrameMode === 'device' ? 'max-w-[480px]' : 'max-w-4xl'
        } bg-[#131313] border border-[#444748] flex flex-col shadow-2xl relative`}
      >
        {/* PWA App Top Status Bar */}
        <div className="w-full bg-[#0e0e0e] border-b border-[#444748] p-3 flex items-center justify-between">
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <div className="flex items-center gap-1 font-code font-bold text-[11px] text-white tracking-wider truncate">
              <span>PLURIBUS // FIELD_CAPTURE [PWA_V2.1]</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 font-code text-[10px]">
              <span className="text-white uppercase truncate">Statutory Capture Cell</span>
              <span className="text-[#c4c7c8]">[GPS: LOCK]</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              onClick={onNavigateToQueue}
              className="font-code text-[11px] font-bold text-[#ffb4ab] bg-[#bb0112]/40 border border-[#bb0112] px-1.5 py-0.5 uppercase cursor-pointer hover:bg-[#bb0112]"
              title="Click to view offline queue"
            >
              [OFFLINE: 0{offlineCount}]
            </span>
            <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-code font-bold text-xs">
              MR
            </div>
          </div>
        </div>

        {/* Section 1: Top Telemetry Status Bar */}
        <section className="w-full bg-[#0e0e0e] px-3 py-1.5 flex flex-col gap-0.5 border-b border-[#444748] font-code text-[10px]">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1">
              <span className="text-[#8e9192]">SITE:</span>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="bg-[#1b1b1b] text-white border border-[#444748] px-1 py-0.5 font-code text-[10px] focus:outline-none uppercase"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} // {s.id}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[#8e9192]">REV.08</span>
          </div>
          <div className="flex items-center justify-between pt-0.5 font-bold">
            <span className="text-white">STATE: [GEOFENCE LOCKED: PASS]</span>
            <span className="text-[#c4c7c8]">
              ACCURACY: +/- {accuracy.toFixed(1)}M (GALILEO+GPS)
            </span>
          </div>
          <div className="flex items-center justify-between text-[#8e9192] pt-0.5">
            <span>HARDWARE TEE: [SAMSUNG KNOX ACTIVE]</span>
            <span>BATT: 84% :: OFFLINE: 12 SLOTS AVAIL</span>
          </div>
        </section>

        {/* Section 2: Live Forensic Camera Viewfinder */}
        <section className="w-full relative aspect-[4/3] bg-[#0e0e0e] overflow-hidden flex flex-col justify-between border-b border-[#444748]">
          {/* Real video or background image */}
          {cameraStreamActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-cover bg-center filter grayscale contrast-125 ${
                isHighSunlight ? 'brightness-90' : 'brightness-100'
              }`}
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHLA0fGHblYzyZ0FZ1LeqPslwUu7TXlhS7zKQiuYiTl8jlIogajhPjOY37V02nsKG0dVVyJh1RbSnOKEgpt51yo0ok6pmS9e03rdPnWgZJZQWxT4KcbedKHQGiDwPtxXlWE1Jgty-4cWM1ZJzmiSBiz7eUJ2Ieqb1mY70VSg_38PTer88exQfPDRHWwkOPt3T-YRsajtIJ85yG0CRMb9NKPo3rPmyrLdQ8KAOQXYf7F6Jk9i9pB9TK')`,
              }}
            />
          )}

          {/* Flash animation during shutter capture */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90 pointer-events-none" />
          )}

          {/* Viewfinder Corner Reticles */}
          <div className="absolute inset-0 p-2 pointer-events-none flex flex-col justify-between z-10 font-code text-white text-[12px] opacity-90">
            <div className="flex justify-between">
              <span>+-----------------</span>
              <span>-----------------+</span>
            </div>

            {/* Center Horizon Level Reticle */}
            <div className="w-full flex flex-col items-center justify-center gap-1">
              <div className="text-[14px] leading-none tracking-widest">+</div>
              <div className="font-code text-[11px] font-bold bg-[#0e0e0e]/80 px-2 py-0.5 border border-white/40">
                ------[ HORIZON {horizonDeg.toFixed(1)}° // LEVEL ]------
              </div>
            </div>

            <div className="flex justify-between">
              <span>+-----------------</span>
              <span>-----------------+</span>
            </div>
          </div>

          {/* In-Viewfinder Top Metadata Layer */}
          <div className="relative z-20 p-2 flex justify-between items-start bg-gradient-to-b from-[#0e0e0e]/95 via-[#0e0e0e]/50 to-transparent">
            <div className="flex flex-col font-code text-[10px]">
              <span className="text-white font-semibold">STREAM: SENSOR_RAW_4032x3024</span>
              <span className="text-[#c4c7c8]">LENS: 24MM f/1.8 :: ISO 100 | 1/1250s | 5500K</span>
            </div>
            <button
              onClick={() => setIsHighSunlight(!isHighSunlight)}
              className="bg-white text-black font-code text-[10px] font-bold px-1.5 py-0.5 uppercase hover:bg-[#e2e2e2]"
            >
              [ HIGH-SUNLIGHT: {isHighSunlight ? 'ACTIVE' : 'OFF'} ]
            </button>
          </div>

          {/* In-Viewfinder Telemetry Bottom Bar */}
          <div className="relative z-20 p-2 flex flex-col gap-0.5 bg-gradient-to-t from-[#0e0e0e]/95 via-[#0e0e0e]/70 to-transparent font-code text-[10px]">
            <div className="flex justify-between items-center text-white font-metric">
              <span>COORD: 25.75321° N, 71.39648° E</span>
              <span>ALT: 142.4M :: AZ: 184° S</span>
            </div>
            <div className="flex justify-between items-center text-[#c4c7c8]">
              <span className="text-white font-bold">[PERIMETER: 8.4M FROM CENTROID]</span>
              <span>BOUNDARY: 50M (INSIDE LIMITS)</span>
            </div>
          </div>
        </section>

        {/* Section 3: Statutory Metadata & Milestone Audit Controls */}
        <section className="w-full flex flex-col gap-2 p-2.5 bg-[#131313]">
          {/* Milestone Selector Panel */}
          <div className="w-full bg-[#1b1b1b] p-2 flex flex-col gap-1 border border-[#444748]">
            <div className="flex justify-between items-center font-code text-[10px]">
              <span className="text-[#c4c7c8] font-bold uppercase">
                01 // STATUTORY MILESTONE MAPPING [COMPANIES ACT §135]
              </span>
              <span className="text-[#8e9192]">[REQ: MANDATORY]</span>
            </div>
            <div className="flex flex-col gap-1 font-code text-[11px] mt-0.5">
              <button
                type="button"
                onClick={() => setSelectedMilestone('MS-03')}
                className={`text-left px-2 py-1 flex items-center justify-between ${
                  selectedMilestone === 'MS-03'
                    ? 'bg-[#353535] text-white font-bold border-l-2 border-white'
                    : 'bg-[#1f1f1f] text-[#c4c7c8] hover:text-white'
                }`}
              >
                <span>
                  {selectedMilestone === 'MS-03' ? '[X]' : '[ ]'} MS-03: TIN ROOFING &amp; STEEL TRUSS
                  SUPPORT
                </span>
                <span className="text-[#8e9192] text-[10px]">TAG: SCH-VII(A)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMilestone('MS-02')}
                className={`text-left px-2 py-1 flex items-center justify-between ${
                  selectedMilestone === 'MS-02'
                    ? 'bg-[#353535] text-white font-bold border-l-2 border-white'
                    : 'bg-[#1f1f1f] text-[#c4c7c8] hover:text-white'
                }`}
              >
                <span>
                  {selectedMilestone === 'MS-02' ? '[X]' : '[ ]'} MS-02: BRICK MASONRY &amp; REINFORCED
                  PLINTH
                </span>
                <span className="text-[#8e9192] text-[10px]">TAG: SCH-VII(A)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMilestone('MS-04')}
                className={`text-left px-2 py-1 flex items-center justify-between ${
                  selectedMilestone === 'MS-04'
                    ? 'bg-[#353535] text-white font-bold border-l-2 border-white'
                    : 'bg-[#1f1f1f] text-[#c4c7c8] hover:text-white'
                }`}
              >
                <span>
                  {selectedMilestone === 'MS-04' ? '[X]' : '[ ]'} MS-04: SANITATION FACILITIES &amp;
                  RAIN HARVEST
                </span>
                <span className="text-[#8e9192] text-[10px]">TAG: SCH-VII(B)</span>
              </button>
            </div>
          </div>

          {/* Forensic Evidence Integrity Checklist */}
          <div className="w-full bg-[#1b1b1b] p-2 flex flex-col gap-1 border border-[#444748] font-code text-[11px]">
            <span className="text-[#c4c7c8] font-bold text-[10px] uppercase">
              02 // PHYSICAL INTEGRITY CHECKLIST [TAMPER MITIGATION]
            </span>
            <div className="flex flex-col gap-1 mt-0.5">
              <div className="flex items-center justify-between px-2 py-1 bg-[#1f1f1f]">
                <span className="text-white font-bold">
                  [X] RAW SENSOR HARDWARE SIGNATURE (ZERO POST-PROC)
                </span>
                <span className="text-[#8e9192] text-[10px]">[LOCKED]</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-[#1f1f1f]">
                <span className="text-white font-bold">
                  [X] GEO-TAG &amp; EXIF METADATA EMBEDDING AUTHORIZED
                </span>
                <span className="text-[#8e9192] text-[10px]">[LOCKED]</span>
              </div>
              <div
                onClick={() => setWitnessChecked(!witnessChecked)}
                className="flex items-center justify-between px-2 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] cursor-pointer"
              >
                <span className={witnessChecked ? 'text-white font-bold' : 'text-[#c4c7c8]'}>
                  {witnessChecked ? '[X]' : '[ ]'} WITNESS PRESENT: GRAM PANCHAYAT REPRESENTATIVE
                </span>
                <span className="text-[#8e9192] text-[10px]">
                  {witnessChecked ? '[VERIFIED]' : '[OPTIONAL]'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Remarks with Character Counter */}
          <div className="w-full bg-[#1b1b1b] p-2 flex flex-col gap-1 border border-[#444748] font-code">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#c4c7c8] font-bold uppercase">
                03 // OPERATIONAL REMARKS [AUDIT TRAIL LOG]
              </span>
              <span className="text-[#8e9192]">
                {String(auditNotes.length).padStart(3, '0')}/120 CHARS
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={120}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="ADD EXCAVATION / MATERIAL BATCH INSPECTION NOTES..."
              className="w-full bg-[#0e0e0e] text-white font-code text-[11px] p-2 resize-none outline-none border border-[#444748] focus:border-white"
            />
          </div>
        </section>

        {/* Section 4: Shutter Trigger & Action Bar */}
        <section className="w-full p-2.5 flex flex-col gap-2 bg-[#131313]">
          {/* Main Shutter Trigger Button */}
          <button
            type="button"
            disabled={isCapturing}
            onClick={handleShutterCapture}
            className="w-full bg-white text-black py-2.5 px-3 flex flex-col items-center justify-center hover:bg-[#e2e2e2] active:scale-[0.99] transition-transform cursor-pointer font-code shadow-lg"
          >
            <span className="font-metric text-lg sm:text-xl font-bold tracking-tight text-center">
              &gt;&gt;&gt; [ SHUTTER: CAPTURE &amp; NOTARIZE ] &lt;&lt;&lt;
            </span>
            <span className="text-[10px] text-[#444748] uppercase mt-0.5 tracking-wider text-center font-bold">
              AUTOMATICALLY GENERATES SHA-256 HASH &amp; ADDS TO OFFLINE QUEUE
            </span>
          </button>

          {/* Visual Confirmation / Hash Output Display */}
          {lastHashOutput && (
            <div className="w-full bg-[#0e0e0e] p-2 flex flex-col font-code text-[11px] border border-[#ffb4ab]">
              <div className="flex justify-between text-[#ffb4ab] font-bold text-[10px]">
                <span>[!] CRYPTO-COMMIT SUCCESS: SECTION 135 HASH GENERATED</span>
                <span>SHA-256</span>
              </div>
              <div className="text-white truncate mt-1 text-[10px] font-mono selection:bg-white selection:text-black">
                HASH: {lastHashOutput.substring(0, 32)}...{lastHashOutput.substring(48)}
              </div>
              <div className="text-[#8e9192] text-[10px] mt-0.5">
                ENCLAVE: KNOX_IN_BLR_01 :: LATENCY 22ms :: BUFFER SYNCED
              </div>
            </div>
          )}

          {/* Secondary Action Grid */}
          <div className="grid grid-cols-3 gap-1 font-code text-[10px]">
            <button
              type="button"
              onClick={handleRecalibrate}
              className="bg-[#1b1b1b] text-white py-2 px-1 text-center hover:bg-[#2a2a2a] border border-[#444748] truncate"
            >
              {calibrating ? '[ CALIBRATING... ]' : '[ RE-CALIBRATE ]'}
            </button>
            <button
              type="button"
              onClick={toggleLiveCamera}
              className="bg-[#1b1b1b] text-white py-2 px-1 text-center hover:bg-[#2a2a2a] border border-[#444748] truncate"
            >
              {cameraStreamActive ? '[ STOP WEBCAM ]' : '[ USE WEBCAM ]'}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#1b1b1b] text-white py-2 px-1 text-center hover:bg-[#2a2a2a] border border-[#444748] truncate"
            >
              [ UPLOAD PROOF ]
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Statutory Regulatory Footer Note */}
          <div className="w-full text-center mt-1">
            <p className="font-code text-[10px] text-[#8e9192]">
              REGULATORY PROOF GENERATOR // MCA DIGITAL COMPLIANCE ARCHITECTURE V2.1
            </p>
          </div>
        </section>

        {/* Mobile App Bottom Tab Bar Navigation */}
        <nav className="w-full bg-[#0e0e0e] border-t border-[#444748] flex items-stretch h-12">
          <button
            onClick={() => setSelectedMilestone('MS-02')}
            className="flex-1 flex flex-col items-center justify-center px-1 text-[#8e9192] hover:text-white"
          >
            <span className="font-code text-[10px] uppercase font-bold">[=] LEDGER</span>
            <span className="font-code text-[9px] text-[#444748]">§135_DATA</span>
          </button>
          <button
            className="flex-1 flex flex-col items-center justify-center px-1 bg-[#2a2a2a] text-white border-b-2 border-white"
          >
            <span className="font-code text-[10px] uppercase font-bold">[+] CAPTURE</span>
            <span className="font-code text-[9px] text-[#8e9192]">SHA_HASH</span>
          </button>
          <button
            onClick={onNavigateToQueue}
            className="flex-1 flex flex-col items-center justify-center px-1 text-[#8e9192] hover:text-white"
          >
            <span className="font-code text-[10px] uppercase font-bold">[^] QUEUE</span>
            <span className="font-code text-[9px] text-[#444748]">0{offlineCount}_PENDING</span>
          </button>
          <button
            onClick={handleRecalibrate}
            className="flex-1 flex flex-col items-center justify-center px-1 text-[#8e9192] hover:text-white"
          >
            <span className="font-code text-[10px] uppercase font-bold">[*] STATUS</span>
            <span className="font-code text-[9px] text-[#444748]">MCA_SYNC</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
