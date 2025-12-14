 Patient-Centric 3D Visualization via Browser-Based AI
1. Executive Summary
This detailed research report and Product Requirements Document (PRD) outlines the strategy, technical architecture, and market justification for a novel medical software application: a browser-based, client-side tool that utilizes the Depth Anything V2 foundation model to instantly convert 2D medical images (X-rays, MRI, CT slices) into interactive 3D topological visualizations.
The healthcare industry is currently navigating a complex transition from volume-based to value-based care, where patient engagement, health literacy, and shared decision-making are no longer "soft skills" but critical drivers of reimbursement and clinical outcomes. Despite the sophistication of modern diagnostic imaging, the "last mile" of communication—the delivery of results to the patient—remains fundamentally broken. Patients are routinely presented with dense, jargon-filled text reports or static, grayscale 2D images that require specialized training to interpret. This disconnect leads to increased patient anxiety, reduced adherence to treatment plans, and inefficiencies in clinical workflows.
Our proposed solution leverages the convergence of three maturing technologies in 2025:
Monocular Depth Estimation (MDE): Specifically, the release of Depth Anything V2, which allows for robust, fine-grained depth map generation from single images without the need for multi-view stereo or specialized hardware.1
WebGPU and Client-Side Inference: The standardization of the WebGPU API in modern browsers (Chrome, Edge, Firefox, and Safari 18+) and the optimization of libraries like ONNX Runtime Web allow for desktop-class AI inference to occur entirely within the client’s browser. This eliminates server costs and, crucially, resolves data privacy concerns by ensuring Protected Health Information (PHI) never leaves the patient’s device.3
Reimbursement Mechanisms: The expansion of CPT codes for Remote Patient Monitoring (RPM) and Category III codes for 3D modeling provides a viable economic pathway for providers to monetize enhanced patient education.5
This report projects that the global patient engagement solutions market will reach approximately USD 89.26 billion by 2034, growing at a CAGR of 14.59%.7 By positioning this product at the intersection of AI-driven efficiency and patient empowerment, we address a massive unmet need in a market primed for disruption.
2. Market Dynamics and Business Justification
2.1. The Patient Engagement Solutions Market
The global market for patient engagement solutions is undergoing a period of explosive growth, driven by an aging global population, the rising prevalence of chronic diseases, and a regulatory environment that increasingly penalizes poor patient outcomes.
2.1.1. Market Sizing and Growth Drivers
Current market analysis values the global patient engagement solutions sector at roughly USD 20.3 billion to USD 27.63 billion as of 2024.8 The trajectory for this market is aggressively upward:
2025 Projection: The market is expected to reach USD 33.45 billion in 2025.9
Long-Term Forecast: By 2034, the market is projected to hit USD 89.26 billion, expanding at a Compound Annual Growth Rate (CAGR) of 14.59%.7 Other estimates place the 2030 revenue forecast as high as USD 86.67 billion with a CAGR of roughly 21%.9
North America currently dominates this landscape, accounting for approximately 40% of the revenue share in 2024.7 This dominance is fueled by high per capita healthcare spending, the wide adoption of Electronic Health Records (EHR) mandated by the HITECH Act, and a highly competitive provider landscape where patient satisfaction scores (HCAHPS) directly impact hospital revenue.10
Within this market, the Software and Hardware segment accounts for over 60.5% of the revenue, confirming that digital tools are the primary vehicle for engagement strategies.7 Furthermore, Web and Cloud-based delivery models hold a commanding 76% of the market share, validating our architectural choice of a browser-based, zero-install SaaS platform over legacy on-premise software.7
2.1.2. The "Health and Wellness" Shift
While Chronic Disease Management remains the largest therapeutic application area (capturing over 41% of revenue), the Health and Wellness segment is poised for the fastest growth, with a projected CAGR of 17.9% through 2034.7 This shift indicates a broader consumer trend: patients are no longer passive recipients of care; they are active consumers seeking to understand their own health data. The rise of wearables and consumer health apps has conditioned patients to expect visual, interactive data. Radiology, by contrast, remains stuck in a static, grayscale paradigm.
2.2. The Clinical Need: Closing the Communication Gap
The core value proposition of this product lies in solving the inefficiencies of the "doctor-patient" communication loop, particularly within radiology and orthopedics.
2.2.1. The Radiologist's Burden
Radiology is facing a crisis of volume and commoditization.
Workload vs. Time: The demand for imaging is skyrocketing due to an aging population, yet the radiologist workforce is facing burnout and staffing shortages. Radiologists face immense pressure to improve Turnaround Times (TAT), with expectations for STAT exams often set at 30 to 60 minutes.11
The "Invisible" Specialist: Radiologists historically operated as "the doctor's doctor," with little direct patient contact. However, the 21st Century Cures Act now mandates immediate patient access to test results. This means patients often see their complex MRI reports before their referring physician explains them, leading to confusion and panic.12
Inefficient Reporting: Radiologists spend only 36.4% of their time actually interpreting images; the rest is consumed by administrative tasks and fragmented communication with referring providers.13 A tool that automates the visualization of findings for the patient could significantly reduce the time radiologists or referring physicians spend explaining basic anatomy, allowing them to focus on clinical decision-making.
2.2.2. The Orthopedic Conversion Challenge
For orthopedic surgeons, the challenge is conversion and consent.
Visualization Barrier: Explaining a complex three-dimensional problem (e.g., a spiral fracture or a acetabular dysplasia) using a 2D X-ray is notoriously difficult. Surgeons often resort to drawing on paper or using generic plastic models that do not reflect the patient's specific anatomy.14
Impact on Surgery Booking: Studies indicate that 98% of patients felt that 3D models improved their understanding of a proposed surgery.15 In elective and cosmetic procedures, this understanding is directly correlated with the decision to proceed. Patient-specific 3D visualization creates a sense of "anticipatory satisfaction" and trust, reducing no-show rates and increasing consultation booking rates.16 The "conversion rate" from consultation to surgery is a critical KPI for private practices, and 3D visualization is a proven lever to increase it.
2.3. Competitive Landscape Analysis
The current market for anatomical visualization is polarized between generic educational tools and high-end surgical planning suites, leaving a massive gap for patient-specific educational visualization.

Feature
Generic Anatomy Atlases (BioDigital, Complete Anatomy)
Surgical Planning Software (Materialise, Axial3D)
Proposed Product (AI Visualization)
Data Source
Pre-built, idealized 3D libraries.
Patient CT/MRI (DICOM) segmentation.
Patient 2D Image (JPEG/DICOM) via AI.
Personalization
Low (Generic human model).
High (Exact patient anatomy).
Medium (Patient-specific topology approx).
Cost
High subscription ($15-$100/user/yr).17
Very High ($3,000+ per case).18
Low (Client-side compute = $0 marginal cost).
Time to View
Instant (for generic models).
Hours to Days (requires expert segmentation).
Seconds (Real-time inference).
Primary Use
Medical Student Education.
Surgical Guides, Implants, Diagnosis.
Patient Communication & Engagement.
Accessibility
App/Web.
High-end workstation/Desktop.
Mobile Web (WebGPU).

Strategic Gap: Competitors like BioDigital Human offer excellent "textbook" models but cannot instantly visualize this specific patient's pathology from a fresh X-ray.17 Conversely, tools like Materialise are FDA-cleared for diagnosis but are overkill for a 5-minute patient conversation, requiring expensive segmentation services and long lead times.20 Our product fills this gap: it offers the immediacy of an atlas with the personalization of surgical software, at a fraction of the cost.
3. Technical Architecture and Feasibility
The feasibility of this product rests on the capability to run sophisticated AI models directly in a mobile web browser. This section details the architectural decisions required to achieve high performance while adhering to strict privacy and memory constraints.
3.1. AI Model Strategy: Depth Anything V2
The core technological enabler is the Depth Anything V2 architecture.
3.1.1. Model Architecture and Advantages
Depth Anything V2 represents a significant leap over previous Monocular Depth Estimation (MDE) models like MiDaS or V1.
Foundation: It is built upon a DINOv2 backbone (Vision Transformer) with a DPT (Dense Prediction Transformer) decoder.
Training Methodology: The model's robustness stems from its training pipeline. It utilizes 595,000 synthetic labeled images to train a teacher model, which then generates pseudo-labels for 62 million real unlabeled images. This massive scale allows it to generalize to complex, unseen real-world medical images better than models trained on limited datasets.1
Robustness: Crucially for medical imaging, V2 significantly outperforms previous iterations in handling transparent objects (relevant for X-ray overlapping tissues) and fine details (such as hairline fractures or surgical instrumentation), where older models often produced artifacts or "holes" in the mesh.1
Efficiency: Compared to diffusion-based depth models like Marigold, Depth Anything V2 is over 10x faster, making it the only viable candidate for real-time, interactive browser applications.1
3.1.2. Quantization and Optimization for Edge Devices
The "Small" variant of Depth Anything V2 (ViT-S) contains 24.8 million parameters.21 While "small" in AI terms, the raw FP32 weights (~100MB) are too heavy for a seamless mobile web experience.
Quantization Strategy: We must deploy quantized versions of the model.
FP16 (Half-Precision): Reduces model size to ~50MB with negligible accuracy loss. This is the preferred format for WebGPU backends on modern devices (iPhone 12+, high-end Android).22
Int8 (8-bit Integer): Reduces model size to ~25MB. This is essential for bandwidth-constrained environments. However, standard Post-Training Quantization (PTQ) can introduce banding artifacts in depth maps, which appear as "staircase" effects on the 3D surface. To mitigate this, Quantization-Aware Training (QAT) or advanced calibration techniques (like SmoothQuant) should be employed during the ONNX export process to preserve geometric fidelity.23
ONNX Export: The model must be converted from PyTorch to ONNX (Open Neural Network Exchange) format. This acts as the bridge to run the model in the JavaScript ecosystem.25
3.2. Client-Side Inference Engine: The WebGPU Revolution
The choice of runtime engine is the single most critical technical decision. The landscape in 2025 has shifted decisively towards ONNX Runtime Web.
3.2.1. ONNX Runtime Web vs. TensorFlow.js
While TensorFlow.js was the pioneer of browser-based ML, ONNX Runtime Web (ORT-Web) has emerged as the superior solution for Transformer-based models in 2025.
Performance: Benchmarks indicate that ORT-Web, specifically when utilizing the WebGPU execution provider, enables near-native performance. For Transformer models, it can be up to 100x faster than WASM-based CPU inference.27 Conversely, TensorFlow.js often requires converting PyTorch models to Keras/SavedModel formats, a process prone to operator incompatibility and performance degradation.28
Transformers.js Integration: The Transformers.js library (v3+) enables a "one-line" implementation of complex pipelines using ORT-Web. It supports the depth-estimation task out-of-the-box and allows developers to flag device: 'webgpu' to automatically offload compute to the GPU.3
3.2.2. WebGPU vs. WebAssembly (WASM)
WebGPU: This is the primary target. Unlike WebGL, which requires hacking compute tasks into graphics shaders, WebGPU provides low-level access to the GPU's compute capabilities. This is essential for the matrix multiplications inherent in the Vision Transformer backbone of Depth Anything V2.30 As of 2025, WebGPU is supported in Chrome, Edge, Firefox (141+), and is gaining support in Safari (often behind feature flags on iOS).4
WASM Fallback: For older devices or browsers without WebGPU (e.g., older iOS Safari), the application must fallback to WebAssembly (WASM) with SIMD (Single Instruction, Multiple Data) support. While slower (seconds vs. milliseconds), it ensures the application remains functional across the widest range of devices.31
3.3. 3D Rendering and Mobile Constraints
Visualizing the AI output requires a robust 3D engine capable of handling vertex displacement on mobile hardware.
3.3.1. Rendering Engine: React Three Fiber (R3F)
We recommend React Three Fiber (R3F), a React renderer for Three.js. R3F allows for a declarative component structure (e.g., <Mesh />, <Material />) that integrates seamlessly with the application's UI state (React), making it easier to manage the complex state logic of a medical viewer compared to imperative Three.js code.32
3.3.2. The "Safari Limit": Memory Management
The most significant technical risk is the iOS Safari Canvas Memory Limit.
The Constraint: Mobile Safari historically enforces a strict limit on the total memory a canvas element can consume. While newer devices (iPhone 15 Pro) have more headroom, many active devices are capped at 288MB - 384MB for the WebGL context. Exceeding this causes the browser to crash the page instantly with a "Total canvas memory use exceeds the maximum limit" error.34
Mitigation Strategy 1 (Resolution): We cannot render 4K textures on mobile. The inference should run at the model's native resolution (e.g., 518x518), and the resulting depth map should be upscaled using a custom shader with bicubic interpolation rather than creating a high-resolution geometry that consumes massive VRAM. This balances visual quality with memory safety.36
Mitigation Strategy 2 (Disposal): The application must implement aggressive garbage collection. When a user uploads a new image, the previous geometry, material, and texture objects must be explicitly disposed of (.dispose()) to free up GPU memory handles before allocating new ones.37
3.3.3. DICOM Parsing via Cornerstone.js
To support actual medical files (not just JPEGs), the application will integrate Cornerstone.js.
Function: Cornerstone is the industry standard for parsing DICOM P10 files in JavaScript. It can extract the raw pixel data and header tags (Patient ID, Modality) entirely client-side.
Workflow: The user drags a DICOM file -> Cornerstone extracts the pixel array -> The array is normalized to an 8-bit RGB image -> The image is passed to the ONNX Runtime for depth estimation. This pipeline ensures compatibility with clinical data standards without requiring a heavy PACS backend.38
4. Regulatory, Legal, and Compliance Strategy
Navigating the FDA and HIPAA landscape is as critical as the technology itself. A misstep here could classify the software as a medical device requiring years of clinical trials.
4.1. FDA Classification: The "Educational" Exemption
The product must be strictly positioned as a Class I Medical Device, utilizing the "Medical Image Communication Device" product code or similar exempt categories.
The Diagnostic Line: The FDA draws a hard line between software that informs clinical management (diagnosing a disease, measuring a tumor for surgery) and software that helps view or communicate existing data. Software driven by AI for diagnostic purposes often falls into Class II (SaMD), requiring 510(k) clearance.40
Exemption Strategy: To maintain Class I (Exempt) status, the product must be labeled explicitly for "Patient Education and Engagement Only". It must carry prominent disclaimers that it is "Not for Diagnostic Use". We are providing a visualization of data the doctor has already diagnosed; we are not creating new diagnostic data. This aligns with the regulatory pathway of generic anatomy apps, even though we use patient-specific data.41
4.2. HIPAA and Data Privacy via Architecture
Zero-Knowledge Architecture: By using ONNX Runtime Web for client-side inference, we achieve a unique privacy posture: Patient data never leaves the device. The image is loaded into the browser's memory, processed by the local CPU/GPU, and rendered locally. No image data is ever uploaded to a cloud server.
Security Implications: This architecture significantly simplifies HIPAA compliance. Since the vendor (us) never "touches" or "stores" the PHI, the need for complex Business Associate Agreements (BAAs) related to data storage is reduced (though a BAA is still required for the hosting of the application code itself). This "privacy-by-design" is a massive selling point for hospital IT security reviews.3
4.3. AI Transparency and Liability
Legislative Trends: New laws, such as the EU AI Act and California's AB 3030, require transparency when users interact with AI-generated content.
Implementation: The UI must clearly label the 3D model as "AI-Generated Visualization". It must include tooltips or modals explaining that the depth is a mathematical estimation, not a physical scan (like a LiDAR scan). The disclaimer should state: "This visualization is generated by artificial intelligence for educational purposes only. It is a simulation and may not perfectly reflect anatomical reality. Consult your physician for medical interpretation.".44
5. Economic Model and Reimbursement Strategy
To be viable, the product must generate revenue for the providers who use it. We have identified specific CPT codes that this tool supports.
5.1. Remote Patient Monitoring (RPM)
The product strongly supports the reimbursement of RPM codes, specifically regarding patient education.
CPT 99453 ($19 - $21): This code covers the "initial set-up and patient education on use of equipment." By using our 3D tool to visually explain why monitoring is necessary (e.g., showing a 3D visualization of a heart condition), providers can justify the education component of this code, ensuring higher patient compliance and retention for the recurring monthly codes.6
CPT 99454 ($46 - $50): This code pays for the monthly supply of the device and data transmission. High patient engagement (driven by understanding their condition via 3D) reduces churn, protecting this recurring revenue stream.47
5.2. Evaluation and Management (E/M) Efficiency
Time is Money: Physicians bill based on time or complexity (E/M codes 99202-99215). If a 3D visualization allows a surgeon to explain a complex fracture in 2 minutes instead of 10 minutes of drawing on paper, that efficiency allows them to see more patients or bill for a higher complexity level based on the extensive counseling provided.48
5.3. Tracking Codes for 3D Printing (Category III)
CPT 0559T - 0562T: These are temporary tracking codes for the production of 3D-printed anatomical models. While our product is digital, the existence of these codes demonstrates the AMA's recognition of the clinical value of 3D anatomical representation. Clinics already billing these codes for physical prints can use our digital tool as a low-cost precursor or value-add.5
6. Product Requirements Document (PRD)
6.1. Product Overview
Product Name: [Product Name]
Type: Web-Based Medical Visualization Application (SaaS).
Core Technology: Client-Side AI (Depth Anything V2) + WebGPU + WebGL.
Primary Goal: To provide instant, secure, and interactive 3D visualizations of patient anatomy from 2D images to enhance patient understanding and engagement.
6.2. User Personas
The Patient: Has low health literacy. Anxious about their condition. Owns a smartphone (iPhone/Android). Wants to "see" what is wrong.
The Orthopedic Surgeon: Busy, visual thinker. Frustrated by the inability to explain 3D concepts with 2D tools. Needs a "wow" factor to convert consultations into scheduled surgeries.
The Radiologist: Overworked. Wants to add value to their report to stand out from AI-only commoditization.
6.3. Functional Requirements
6.3.1. Image Ingestion
ID
Requirement
Description
Priority
FR-01
Multi-Format Upload
System must accept standard image formats (JPEG, PNG) and medical formats (DICOM P10 via .dcm extension).
P0
FR-02
Client-Side DICOM Parsing
System must extract pixel data and metadata (Patient ID, Modality) from DICOM files using Cornerstone.js without server upload.
P0
FR-03
Camera Capture
On mobile devices, the system must allow direct camera capture to photograph physical film X-rays on a light box.
P1

6.3.2. AI Inference
ID
Requirement
Description
Priority
FR-04
Depth Estimation
System must generate a depth map from the input image using the Depth-Anything-V2-Small model.
P0
FR-05
Hardware Acceleration
System must detect WebGPU availability and utilize the webgpu execution provider in ONNX Runtime.
P0
FR-06
Graceful Fallback
If WebGPU is unavailable (e.g., older iOS), system must automatically fallback to WASM with SIMD acceleration.
P0
FR-07
Inference Feedback
System must display a progress indicator ("Analyzing Anatomy...") during the inference process.
P1

6.3.3. 3D Visualization
ID
Requirement
Description
Priority
FR-08
Displacement Rendering
System must render a 3D plane displaced by the generated depth map data.
P0
FR-09
Interaction Controls
Users must be able to Rotate (orbit), Pan, and Zoom the 3D model via touch gestures and mouse input.
P0
FR-10
Depth Intensity Slider
Users must be able to adjust the displacementScale in real-time to exaggerate or flatten the 3D effect.
P1
FR-11
View Reset
A button to instantly reset the camera to the original 2D-aligned view.
P2

6.3.4. Tools and Sharing
ID
Requirement
Description
Priority
FR-12
Annotation Tools
Provider can draw simple shapes (circle, arrow) on the 3D canvas to highlight pathology.
P2
FR-13
Secure Export
System can generate a secure link/QR code that encodes the parameters to re-generate the view on the patient's device, or saves the session to LocalStorage.
P2

6.4. Non-Functional Requirements (NFRs)
6.4.1. Performance
Inference Latency:
WebGPU (Desktop/High-end Mobile): < 1.5 seconds.
WASM (Fallback): < 5 seconds.
Frame Rate: The 3D viewer must maintain a minimum of 30 FPS (ideally 60 FPS) on an iPhone 13 or equivalent during interaction.
Load Time: The initial download of the quantized model (~25-50MB) must be cached in the browser Cache API for instant subsequent loads.
6.4.2. Reliability and Memory
Crash Prevention: The application must monitor memory usage and strictly adhere to iOS Safari limits (~384MB canvas). It must handle webglcontextlost events by attempting to restore the context or prompting a page reload.
Texture Limits: Maximum texture size shall be capped at 2048x2048 for mobile devices to prevent OOM (Out of Memory) errors.
6.4.3. Privacy and Compliance
Data Residency: No pixel data of the medical image shall be transmitted to any remote server. All processing is Local-First.
Auditability: The application must not log any PII (Personally Identifiable Information) in server access logs (e.g., avoiding URL parameters containing names).
6.5. User Interface (UI) Design Guidelines
Aesthetic: Clean, clinical, "medical-grade" trustworthiness. White/Grey background, blue accent colors (associated with trust/healthcare).
Mobile-First: All buttons and sliders must be touch-friendly (minimum 44px touch targets).
Transparency: A persistent "Privacy Shield" icon/badge in the corner stating "Secure Device-Side Processing."
6.6. Risk Management
Risk
Impact
Mitigation Strategy
"Hallucination" of Depth
Medium. AI might misinterpret a shadow as a cavity.
prominent "Educational Use Only" disclaimers. Training providers to explain it as a "simulation."
Browser Incompatibility
High. WebGPU is still evolving.
Robust WASM fallback implementation. Feature detection logic.
Battery Drain
Low. GPU usage is intensive.
AI inference runs only once per image. Rendering loop pauses when idle (not interacting).

7. Roadmap and Phasing
Phase 1 (MVP - Q2 2025): Core browser viewer. JPEG/PNG support. WebGPU/WASM inference. Basic OrbitControls. Mobile support.
Phase 2 (Clinical - Q3 2025): DICOM P10 support via Cornerstone.js. Annotation tools. "Save to PDF" report generation.
Phase 3 (Integration - Q4 2025): EHR Integration (SMART on FHIR) to launch the viewer directly from Epic/Cerner patient portals. Video support ("Video Depth Anything") for ultrasound loops.
Report Prepared By: Product Strategy & Engineering Team
Date: December 14, 2025

https://gemini.google.com/share/748624b68dde