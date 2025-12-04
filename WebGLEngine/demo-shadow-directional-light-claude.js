import React, { useEffect, useRef, useState } from 'react';

const ShadowMapDemo = () => {
  const canvasRef = useRef(null);
  const [showShadowMap, setShowShadowMap] = useState(false);
  const [lightAngle, setLightAngle] = useState(45);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
      alert('WebGL2 no disponible');
      return;
    }

    // ==================== UTILIDADES ====================
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl, vsSource, fsSource) {
      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    // Funciones de matrices
    const mat4 = {
      create: () => new Float32Array(16),
      identity: (out) => {
        out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
      },
      perspective: (out, fovy, aspect, near, far) => {
        const f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = (far + near) / (near - far); out[11] = -1;
        out[12] = 0; out[13] = 0; out[14] = (2 * far * near) / (near - far); out[15] = 0;
        return out;
      },
      ortho: (out, left, right, bottom, top, near, far) => {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        out[0] = -2 * lr; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = -2 * bt; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = 2 * nf; out[11] = 0;
        out[12] = (left + right) * lr; out[13] = (top + bottom) * bt; out[14] = (far + near) * nf; out[15] = 1;
        return out;
      },
      lookAt: (out, eye, center, up) => {
        const eyex = eye[0], eyey = eye[1], eyez = eye[2];
        const upx = up[0], upy = up[1], upz = up[2];
        const centerx = center[0], centery = center[1], centerz = center[2];
        
        let z0 = eyex - centerx, z1 = eyey - centery, z2 = eyez - centerz;
        let len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len; z1 *= len; z2 *= len;
        
        let x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
          x0 = 0; x1 = 0; x2 = 0;
        } else {
          len = 1 / len;
          x0 *= len; x1 *= len; x2 *= len;
        }
        
        let y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
          y0 = 0; y1 = 0; y2 = 0;
        } else {
          len = 1 / len;
          y0 *= len; y1 *= len; y2 *= len;
        }
        
        out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
        out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
        out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;
        return out;
      },
      multiply: (out, a, b) => {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        
        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return out;
      },
      translate: (out, a, v) => {
        const x = v[0], y = v[1], z = v[2];
        out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
        out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        return out;
      },
      scale: (out, a, v) => {
        const x = v[0], y = v[1], z = v[2];
        out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x;
        out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y;
        out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z;
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
        return out;
      }
    };

    // ==================== SHADERS ====================
    
    // Shader para generar el shadow map (primera pasada)
    const shadowVS = `#version 300 es
    in vec3 a_position;
    uniform mat4 u_lightSpaceMatrix;
    uniform mat4 u_model;
    
    void main() {
      gl_Position = u_lightSpaceMatrix * u_model * vec4(a_position, 1.0);
    }`;

    const shadowFS = `#version 300 es
    precision highp float;
    out vec4 fragColor;
    
    void main() {
      // No necesitamos escribir nada, la profundidad se escribe automáticamente
      fragColor = vec4(1.0);
    }`;

    // Shader para renderizar la escena con sombras (segunda pasada)
    const sceneVS = `#version 300 es
    in vec3 a_position;
    in vec3 a_normal;
    
    uniform mat4 u_model;
    uniform mat4 u_view;
    uniform mat4 u_projection;
    uniform mat4 u_lightSpaceMatrix;
    
    out vec3 v_normal;
    out vec3 v_fragPos;
    out vec4 v_fragPosLightSpace;
    
    void main() {
      vec4 worldPos = u_model * vec4(a_position, 1.0);
      v_fragPos = worldPos.xyz;
      v_normal = mat3(u_model) * a_normal;
      v_fragPosLightSpace = u_lightSpaceMatrix * worldPos;
      gl_Position = u_projection * u_view * worldPos;
    }`;

    const sceneFS = `#version 300 es
    precision highp float;
    
    in vec3 v_normal;
    in vec3 v_fragPos;
    in vec4 v_fragPosLightSpace;
    
    uniform vec3 u_lightDir;
    uniform vec3 u_viewPos;
    uniform vec3 u_color;
    uniform sampler2D u_shadowMap;
    
    out vec4 fragColor;
    
    float calculateShadow(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {
      // Convertir a coordenadas NDC
      vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
      
      // Transformar a rango [0,1]
      projCoords = projCoords * 0.5 + 0.5;
      
      // Salir si está fuera del frustum de luz
      if(projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || 
         projCoords.y < 0.0 || projCoords.y > 1.0)
        return 0.0;
      
      // Obtener profundidad desde el shadow map
      float closestDepth = texture(u_shadowMap, projCoords.xy).r;
      float currentDepth = projCoords.z;
      
      // Bias para evitar shadow acne
      float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.001);
      
      // PCF (Percentage Closer Filtering) para suavizar sombras
      float shadow = 0.0;
      vec2 texelSize = 1.0 / vec2(textureSize(u_shadowMap, 0));
      for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
          float pcfDepth = texture(u_shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
          shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
        }
      }
      shadow /= 9.0;
      
      return shadow;
    }
    
    void main() {
      vec3 normal = normalize(v_normal);
      vec3 lightDir = normalize(-u_lightDir);
      
      // Ambient
      vec3 ambient = 0.3 * u_color;
      
      // Diffuse
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = diff * u_color;
      
      // Specular
      vec3 viewDir = normalize(u_viewPos - v_fragPos);
      vec3 halfwayDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
      vec3 specular = vec3(0.3) * spec;
      
      // Calcular sombra
      float shadow = calculateShadow(v_fragPosLightSpace, normal, lightDir);
      
      // Combinar iluminación (las sombras solo afectan diffuse y specular)
      vec3 lighting = ambient + (1.0 - shadow) * (diffuse + specular);
      
      fragColor = vec4(lighting, 1.0);
    }`;

    // Shader para visualizar el shadow map
    const debugVS = `#version 300 es
    in vec2 a_position;
    out vec2 v_texCoord;
    
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

    const debugFS = `#version 300 es
    precision highp float;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    out vec4 fragColor;
    
    void main() {
      float depth = texture(u_texture, v_texCoord).r;
      fragColor = vec4(vec3(depth), 1.0);
    }`;

    // Crear programas de shader
    const shadowProgram = createProgram(gl, shadowVS, shadowFS);
    const sceneProgram = createProgram(gl, sceneVS, sceneFS);
    const debugProgram = createProgram(gl, debugVS, debugFS);

    // ==================== GEOMETRÍA ====================
    
    // Crear un cubo
    function createCube() {
      const positions = new Float32Array([
        // Front
        -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1,
        // Back
        -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1, -1,
        // Top
        -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
        // Bottom
        -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1,
        // Right
         1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,
        // Left
        -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1
      ]);

      const normals = new Float32Array([
        // Front
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        // Back
        0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
        // Top
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        // Bottom
        0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
        // Right
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
        // Left
        -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0
      ]);

      const indices = new Uint16Array([
        0, 1, 2,  0, 2, 3,   // Front
        4, 5, 6,  4, 6, 7,   // Back
        8, 9, 10, 8, 10, 11, // Top
        12, 13, 14, 12, 14, 15, // Bottom
        16, 17, 18, 16, 18, 19, // Right
        20, 21, 22, 20, 22, 23  // Left
      ]);

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      return { posBuffer, normalBuffer, indexBuffer, indexCount: indices.length };
    }

    // Crear un plano
    function createPlane() {
      const positions = new Float32Array([
        -10, 0, -10,  10, 0, -10,  10, 0,  10, -10, 0,  10
      ]);

      const normals = new Float32Array([
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0
      ]);

      const indices = new Uint16Array([0, 1, 2,  0, 2, 3]);

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      return { posBuffer, normalBuffer, indexBuffer, indexCount: indices.length };
    }

    const cube = createCube();
    const plane = createPlane();

    // Quad para debug
    const quadPositions = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadPositions, gl.STATIC_DRAW);

    // ==================== SHADOW MAP FRAMEBUFFER ====================
    const SHADOW_MAP_SIZE = 2048;
    
    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const shadowFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
    
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer no completo');
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // ==================== FUNCIÓN DE RENDERIZADO ====================
    function render(angle) {
      const cameraPos = [8, 8, 8];
      const cameraTarget = [0, 0, 0];
      
      // Calcular dirección de luz basada en el ángulo
      const lightAngleRad = (angle * Math.PI) / 180;
      const lightDir = [
        Math.sin(lightAngleRad),
        -0.7,
        Math.cos(lightAngleRad)
      ];
      
      // PASO 1: Calcular el frustum ortográfico ajustado
      // Para este ejemplo, usamos valores fijos pero bien ajustados a la escena
      // La escena tiene un plano de 20x20 y cubos de tamaño ~2
      const sceneBounds = {
        minX: -10, maxX: 10,
        minY: -1, maxY: 5,
        minZ: -10, maxZ: 10
      };
      
      // Crear matriz de vista de la luz
      const lightView = mat4.create();
      const lightPos = [
        -lightDir[0] * 20,
        -lightDir[1] * 20,
        -lightDir[2] * 20
      ];
      mat4.lookAt(lightView, lightPos, [0, 0, 0], [0, 1, 0]);
      
      // Crear proyección ortográfica AJUSTADA a la escena
      const lightProjection = mat4.create();
      mat4.ortho(
        lightProjection,
        sceneBounds.minX, sceneBounds.maxX,  // left, right
        sceneBounds.minY, sceneBounds.maxY,  // bottom, top
        0.1, 50  // near, far
      );
      
      // Combinar ambas matrices
      const lightSpaceMatrix = mat4.create();
      mat4.multiply(lightSpaceMatrix, lightProjection, lightView);

      // ========== PRIMERA PASADA: GENERAR SHADOW MAP ==========
      gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
      gl.viewport(0, 0, SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.cullFace(gl.FRONT); // Culling frontal para reducir peter panning

      gl.useProgram(shadowProgram);
      const shadowLocs = {
        position: gl.getAttribLocation(shadowProgram, 'a_position'),
        lightSpace: gl.getUniformLocation(shadowProgram, 'u_lightSpaceMatrix'),
        model: gl.getUniformLocation(shadowProgram, 'u_model')
      };

      gl.uniformMatrix4fv(shadowLocs.lightSpace, false, lightSpaceMatrix);

      // Renderizar cubos
      const cubePositions = [
        [0, 1, 0],
        [3, 1.5, 2],
        [-3, 1, -2]
      ];

      cubePositions.forEach(pos => {
        const model = mat4.create();
        mat4.identity(model);
        mat4.translate(model, model, pos);
        gl.uniformMatrix4fv(shadowLocs.model, false, model);

        gl.bindBuffer(gl.ARRAY_BUFFER, cube.posBuffer);
        gl.enableVertexAttribArray(shadowLocs.position);
        gl.vertexAttribPointer(shadowLocs.position, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer);
        gl.drawElements(gl.TRIANGLES, cube.indexCount, gl.UNSIGNED_SHORT, 0);
      });

      // Renderizar plano
      const planeModel = mat4.create();
      mat4.identity(planeModel);
      gl.uniformMatrix4fv(shadowLocs.model, false, planeModel);

      gl.bindBuffer(gl.ARRAY_BUFFER, plane.posBuffer);
      gl.vertexAttribPointer(shadowLocs.position, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane.indexBuffer);
      gl.drawElements(gl.TRIANGLES, plane.indexCount, gl.UNSIGNED_SHORT, 0);

      gl.cullFace(gl.BACK);

      // ========== SEGUNDA PASADA: RENDERIZAR ESCENA CON SOMBRAS ==========
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.1, 0.1, 0.15, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(sceneProgram);
      const sceneLocs = {
        position: gl.getAttribLocation(sceneProgram, 'a_position'),
        normal: gl.getAttribLocation(sceneProgram, 'a_normal'),
        model: gl.getUniformLocation(sceneProgram, 'u_model'),
        view: gl.getUniformLocation(sceneProgram, 'u_view'),
        projection: gl.getUniformLocation(sceneProgram, 'u_projection'),
        lightSpace: gl.getUniformLocation(sceneProgram, 'u_lightSpaceMatrix'),
        lightDir: gl.getUniformLocation(sceneProgram, 'u_lightDir'),
        viewPos: gl.getUniformLocation(sceneProgram, 'u_viewPos'),
        color: gl.getUniformLocation(sceneProgram, 'u_color'),
        shadowMap: gl.getUniformLocation(sceneProgram, 'u_shadowMap')
      };

      // Configurar matrices de cámara
      const view = mat4.create();
      mat4.lookAt(view, cameraPos, cameraTarget, [0, 1, 0]);

      const projection = mat4.create();
      mat4.perspective(projection, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

      gl.uniformMatrix4fv(sceneLocs.view, false, view);
      gl.uniformMatrix4fv(sceneLocs.projection, false, projection);
      gl.uniformMatrix4fv(sceneLocs.lightSpace, false, lightSpaceMatrix);
      gl.uniform3fv(sceneLocs.lightDir, lightDir);
      gl.uniform3fv(sceneLocs.viewPos, cameraPos);

      // Bindear shadow map
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, depthTexture);
      gl.uniform1i(sceneLocs.shadowMap, 0);

      // Renderizar cubos
      cubePositions.forEach((pos, i) => {
        const model = mat4.create();
        mat4.identity(model);
        mat4.translate(model, model, pos);
        gl.uniformMatrix4fv(sceneLocs.model, false, model);

        const colors = [[0.8, 0.3, 0.3], [0.3, 0.8, 0.3], [0.3, 0.3, 0.8]];
        gl.uniform3fv(sceneLocs.color, colors[i]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cube.posBuffer);
        gl.enableVertexAttribArray(sceneLocs.position);
        gl.vertexAttribPointer(sceneLocs.position, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cube.normalBuffer);
        gl.enableVertexAttribArray(sceneLocs.normal);
        gl.vertexAttribPointer(sceneLocs.normal, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer);
        gl.drawElements(gl.TRIANGLES, cube.indexCount, gl.UNSIGNED_SHORT, 0);
      });

      // Renderizar plano
      gl.uniformMatrix4fv(sceneLocs.model, false, planeModel);
      gl.uniform3fv(sceneLocs.color, [0.6, 0.6, 0.6]);

      gl.bindBuffer(gl.ARRAY_BUFFER, plane.posBuffer);
      gl.vertexAttribPointer(sceneLocs.position, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, plane.normalBuffer);
      gl.vertexAttribPointer(sceneLocs.normal, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane.indexBuffer);
      gl.drawElements(gl.TRIANGLES, plane.indexCount, gl.UNSIGNED_SHORT, 0);

      // ========== VISUALIZAR SHADOW MAP (OPCIONAL) ==========
      if (showShadowMap) {
        gl.useProgram(debugProgram);
        const debugLocs = {
          position: gl.getAttribLocation(debugProgram, 'a_position'),
          texture: gl.getUniformLocation(debugProgram, 'u_texture')
        };

        gl.disable(gl.DEPTH_TEST);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.uniform1i(debugLocs.texture, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.enableVertexAttribArray(debugLocs.position);
        gl.vertexAttribPointer(debugLocs.position, 2, gl.FLOAT, false, 0, 0);

        // Renderizar en una esquina
        gl.viewport(canvas.width - 256, canvas.height - 256, 256, 256);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        gl.enable(gl.DEPTH_TEST);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    // ==================== LOOP DE ANIMACIÓN ====================
    let time = 0;
    function animate() {
      time += 0.01;
      render(lightAngle);
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteProgram(shadowProgram);
      gl.deleteProgram(sceneProgram);
      gl.deleteProgram(debugProgram);
      gl.deleteFramebuffer(shadowFramebuffer);
      gl.deleteTexture(depthTexture);
    };
  }, [showShadowMap, lightAngle]);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">Shadow Mapping con Luz Direccional - WebGL2</h1>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3">
            <label className="text-white font-medium">Ángulo de luz:</label>
            <input
              type="range"
              min="0"
              max="360"
              value={lightAngle}
              onChange={(e) => setLightAngle(Number(e.target.value))}
              className="w-48"
            />
            <span className="text-white bg-gray-700 px-3 py-1 rounded">{lightAngle}°</span>
          </div>
          
          <button
            onClick={() => setShowShadowMap(!showShadowMap)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              showShadowMap
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showShadowMap ? 'Ocultar' : 'Mostrar'} Shadow Map
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-400">
          <p><strong>Características:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Proyección ortográfica ajustada a la escena (20x20x6 unidades)</li>
            <li>Shadow map de 2048x2048 para alta calidad</li>
            <li>PCF (Percentage Closer Filtering) para suavizar bordes</li>
            <li>Bias adaptativo para evitar "shadow acne"</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};