# WebGL2Ex Copilot Instructions

## Architecture Overview
This is a WebGL2-based 3D graphics engine and exercise repository. The core engine is in `WebGLEngine/engine/`, with modular components:
- **Pipelines**: Rendering techniques (e.g., `ShadowMapPipeline.js` for shadow mapping, `PhongShadingPipeline.js` for lighting).
- **Core Classes**: `Camera.js`, `StaticMesh.js`, `Material.js` for scene management.
- **Lights**: `DirectionalLight.js`, `PointLight.js`, `SpotLight.js` with properties like color, direction, intensity.
- **Shaders**: GLSL 300 es embedded as strings in pipeline constructors (e.g., vertex/fragment shaders in `ShadowMapPipeline.js`).
- **Models**: OBJ/MTL files in `models/` parsed via `parseOBJFile_ChatGPT.js` for 3D assets.

Data flows from HTML demos (e.g., `default.html`) initializing WebGL context, loading assets, and rendering via pipelines.

## Developer Workflows
- **Running Demos**: Open HTML files (e.g., `WebGLEngine/default.html`) directly in a browser supporting WebGL2. No build step required.
- **Debugging**: Use browser dev tools for WebGL errors; check console for `gl.getParameter(gl.VERSION)` logs.
- **Asset Loading**: Models loaded asynchronously; ensure paths are relative to `/WebGLEngine/` for includes.
- **No Tests/Build**: Pure client-side JS; iterate by refreshing browser.

## Project Conventions
- **Class-Based Structure**: All engine components are ES6 classes (e.g., `class ShadowMapPipeline extends Pipeline`).
- **Shader Integration**: Shaders defined inline in constructors with `#version 300 es`; uniforms/attributes mapped via Maps (e.g., `this.uniforms.set("u_mProj", location)`).
- **Vertex Formats**: Specified as objects like `{ "in_position": 3, "in_texcoord": 2, "in_normal": 3 }`.
- **Matrix Math**: Uses `m4.js` for 4x4 matrices; camera/view/projection matrices passed to shaders.
- **Lighting Models**: Phong/Cook-Torrance shading in dedicated pipelines; lights bound to uniform buffers.
- **File Paths**: Scripts included via `include("/WebGLEngine/engine/...")`; models/textures in subfolders.

## Integration Points
- **External Dependencies**: None; self-contained WebGL2 implementation.
- **Cross-Component Communication**: Pipelines access `gl` context; meshes/materials linked via submeshes.
- **Examples Reference**: Simple demos in folders like `HelloCube/` for basic setup; complex scenes in `WebGLEngine/` for advanced features.

Reference `WebGLEngine/engine/WebGL-Engine.js` for initialization; `pipeline/` for rendering patterns.</content>
<parameter name="filePath">c:\Users\cesar\OneDrive\Documentos\Cesar\Computer Graphics\WebGL\Exercises\WebGL2Ex\.github\copilot-instructions.md