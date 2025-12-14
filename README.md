# MedVis3D - AI-Powered Medical Image 3D Visualization

<p align="center">
  <strong>Transform 2D medical images into interactive 3D visualizations using client-side AI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61dafb" alt="React 19" />
  <img src="https://img.shields.io/badge/Three.js-R3F-black" alt="Three.js" />
  <img src="https://img.shields.io/badge/ONNX_Runtime-WebGPU-orange" alt="ONNX Runtime" />
</p>

---

## 🎯 Overview

MedVis3D is a **privacy-first**, browser-based medical visualization tool that converts 2D medical images (X-rays, CT slices, MRI) into interactive 3D topological visualizations using the **Depth Anything V2** AI model.

**Key Value Proposition:**
- 🔒 **100% Client-Side** - PHI never leaves the patient's device
- ⚡ **WebGPU Accelerated** - Near-native AI inference in browser
- 📱 **Mobile Ready** - Works on iOS Safari and Android Chrome
- 🏥 **HIPAA Friendly** - Zero server-side data processing

---

## ✨ Features

### Implemented ✅

| Category | Feature | Status |
|----------|---------|--------|
| **Input** | JPEG/PNG Upload | ✅ |
| | DICOM P10 Parsing | ✅ |
| | Camera Capture (Mobile) | ✅ |
| | Multi-frame DICOM | ✅ |
| | Video Frame Extraction | ✅ |
| **AI** | Depth Anything V2 Inference | ✅ |
| | WebGPU Backend | ✅ |
| | WASM Fallback | ✅ |
| | Model Caching (Cache API) | ✅ |
| **3D Viewer** | Displacement Mesh Rendering | ✅ |
| | OrbitControls (Rotate/Pan/Zoom) | ✅ |
| | Depth Intensity Slider | ✅ |
| | Wireframe Toggle | ✅ |
| | Screenshot Export | ✅ |
| **Tools** | Annotation (Circle/Arrow/Text/Freehand) | ✅ |
| | PDF Report Export | ✅ |
| | AI Report Generation | ✅ |
| | QR Code Sharing | ✅ |
| | Session Persistence | ✅ |
| **Integration** | SMART on FHIR (EHR Launch) | ✅ |
| | i18n (English/Spanish) | ✅ |
| **UX** | Keyboard Shortcuts | ✅ |
| | Fullscreen Mode | ✅ |
| | Mobile Responsive | ✅ |
| | Memory Management | ✅ |

### Pending 📋

| Feature | Priority | Notes |
|---------|----------|-------|
| Real LLM API Integration | P2 | Currently template-based |
| Anatomy Auto-Labeling | P2 | Requires vision model |
| Multi-language (FR/DE/ZH) | P3 | i18n ready |
| PWA Offline Mode | P3 | Service worker needed |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Modern browser (Chrome 113+, Edge, Firefox 141+, Safari 18+)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/medical_imaging3D.git
cd medical_imaging3D

# Install dependencies
npm install

# Download AI model (REQUIRED)
# Place in: public/models/depth-anything-v2-small.onnx
# Download from: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # Context providers
│   └── sections/          # Page sections
│       ├── HeroSection.tsx
│       ├── UploadSection.tsx
│       ├── InferenceSection.tsx
│       └── ViewerSection.tsx
│
├── components/
│   ├── common/            # Shared components
│   ├── layout/            # Header, Footer, etc.
│   └── ui/                # shadcn/ui components
│
├── features/              # Feature modules
│   ├── ai-assistant/      # AI report generation
│   ├── annotation/        # Drawing tools
│   ├── camera/            # Camera capture
│   ├── dicom/             # DICOM parsing
│   ├── export/            # PDF/screenshot export
│   ├── fhir/              # SMART on FHIR
│   ├── inference/         # ONNX Runtime hooks
│   ├── session/           # Persistence
│   ├── sharing/           # QR/URL sharing
│   ├── video/             # Video processing
│   └── viewer/            # 3D viewer (R3F)
│
├── lib/
│   ├── i18n/              # Internationalization
│   ├── onnx/              # ONNX model loading
│   └── utils/             # Utilities
│
└── stores/                # Zustand state
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` (optional):

```env
# For future LLM integration
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-...
```

### AI Model Setup

**Required:** Download the ONNX model file:

1. Visit [Hugging Face - Depth Anything V2](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf)
2. Download `depth-anything-v2-small.onnx` (~50MB)
3. Place in `public/models/depth-anything-v2-small.onnx`

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Reset view |
| `W` | Toggle wireframe |
| `F` | Toggle fullscreen |
| `⌘/Ctrl + S` | Save screenshot |
| `↑` / `↓` | Adjust depth intensity |
| `Esc` | Exit fullscreen |

---

## 🛡️ Security & Privacy

- **Zero PHI Upload** - All AI processing happens in browser
- **No Server Storage** - Images never leave device
- **HIPAA Architecture** - Privacy-by-design
- **CSP Headers** - XSS protection configured
- **No PII Logging** - Clean audit trail

---

## 📊 Performance Benchmarks

| Metric | WebGPU | WASM Fallback |
|--------|--------|---------------|
| Inference Time | 500ms-1.2s | 2-4s |
| Memory Usage | ~150-200MB | ~100-150MB |
| Frame Rate | 60 FPS | 60 FPS |
| Model Load (cached) | <100ms | <100ms |

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/prd_org.md) | Product Requirements |
| [Design Guidelines](docs/design_guidelines.md) | UI/UX Standards |
| [Gap Analysis](docs/GAP_ANALYSIS.md) | Implementation Status |
| [Progress Update](progress_update.md) | Development Log |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

This project is for educational purposes. See [LICENSE](LICENSE) for details.

---

## ⚠️ Disclaimer

**This software is for EDUCATIONAL and COMMUNICATION purposes only.**

- NOT intended for medical diagnosis
- NOT cleared by FDA for clinical use
- Always consult qualified healthcare professionals

---

## 🙏 Acknowledgments

- [Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2) - AI Model
- [ONNX Runtime Web](https://onnxruntime.ai/) - Browser Inference
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D Rendering
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Cornerstone.js](https://cornerstonejs.org/) - DICOM Support
