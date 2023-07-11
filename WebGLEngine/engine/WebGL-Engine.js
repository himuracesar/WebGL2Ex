
(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

/**
 * Function taken in Geeks for Geeks
 * https://www.geeksforgeeks.org/how-to-include-a-javascript-file-in-another-javascript-file/
 * @param {string} file Path and name of the js file
 */
function include(file) {
 
  let script = document.createElement('script');
  script.src = file;
  script.type = 'text/javascript';
  script.defer = true;

  document.getElementsByTagName('head').item(0).appendChild(script);

}

include("engine/StaticMesh.js");
include("engine/Submesh.js");
include("engine/Material.js");

(function(root, factory){
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
          return factory.call(root);
        });
      } else {
        // Browser globals
        root.webGLengine = factory.call(root);
      }
    }(this, function() {
      "use strict";
    
      const topWindow = this;

      function initWebGL(canvas){
        var gl = canvas.getContext("webgl2");
        if(!gl) {
          alert("Your browser does not support WebGL 2");
          return undefined;
        }
        console.log(gl.getParameter(gl.VERSION));
        console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
        
        return gl;
      }

      /**
       * Create a shader
       * @param {WebGL2RenderingContext} gl Context of WebGL to render
       * @param {int} type Type of shader. The number corresponds to enum gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
       * @param {string} source The source of the shader
       * @return {WebGLShader} The created shader.
       */
      function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        if(!shader){
          console.log("It couldn't to create the shader");
          return;
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
          return shader;
        }
      
        console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
        gl.deleteShader(shader);
    
        return undefined;
    }
    
    /**
     * Create a program and attach and load the shaders on GPU
     * @param {WebGL2RenderingContext} gl Context of WebGL to render
     * @param {WebGLShader} vertexShader Vertex Shader
     * @param {WebGLShader} fragmentShader Fragment Shader
     * @returns {WebGLProgram} program links to shaders
     */
    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
          return program;
        }
      
        console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
        gl.deleteProgram(program);
    
        return undefined;
    }

    /**
     * Resize a canvas to match the size its displayed.
     * @param {HTMLCanvasElement} canvas The canvas to resize.
     * @param {number} [multiplier] amount to multiply by.
     *    Pass in window.devicePixelRatio for native pixels.
     * @return {boolean} true if the canvas was resized.
     * @memberOf module:webgl-utils
     */
    function resizeCanvasToDisplaySize(canvas, multiplier) {
      multiplier = multiplier || 1;
      const width  = canvas.clientWidth  * multiplier | 0;
      const height = canvas.clientHeight * multiplier | 0;
      if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    /**
     * Get the attribute location of the vertex shader
     * @param {WebGL2RenderingContext} gl Context of WebGL to render
     * @param {WebGLProgram} program links to shaders
     * @param {int} location Attribute location of the vertex shader
     * @returns {int} number represents the location of the attribute
     */
    function getAttributeLocation(gl, program, location){
      var in_loc = gl.getAttribLocation(program, location);
      if(in_loc < 0){
          console.log("The attribute " + location + " couldn't find in shaders");
          return;
      }

      return in_loc;
    }

    /**
     * Get the uniform location of the shaders
     * @param {WebGL2RenderingContext} gl Context of WebGL to render
     * @param {WebGLProgram} program links to shaders
     * @param {int} location Uniform location
     * @returns {int} number represents the location of the attribute
     */
    function getUniformLocation(gl, program, location){
      var u_loc = gl.getAttribLocation(program, location);
      if(u_loc < 0){
          console.log("The uniform " + location + " couldn't find in shaders");
          return;
      }

      return u_loc;
    }

    /**
     * Angle in radians
     * @param {float} r 
     * @returns Angle in degree
     */
    function radianToDegree(r) {
      return r * 180 / Math.PI;
    }
  
    /**
     * Degree to radians
     * @param {float} d Angle in degree
     * @returns Angle in radians
     */
    function degreeToRadian(d) {
      return d * Math.PI / 180;
    }

    /**
     * Create buffer
     * @param {WebGL2RenderingContext} gl Context of WebGL to render
     * @returns 
     */
    function createBuffer(gl){
      var buffer = gl.createBuffer();
      if(!buffer){
          console.log("Error to create buffer object");
          return;
      }

      return buffer;
    }
    /**
     * Load ab obj file
     * @param {string} filename Name of the file
     */
    async function loadFileObj(filename){
      let response = await fetch(filename);
      let text = await response.text();
      let obj = parseOBJ(text);
      //let obj = parseOBJFile(text);

      return obj;
  }

    /**
     * Parse the contained of an obj file
     * @param {string} text Contained of the obj file
     * @returns 
     */
    function parseOBJ(text) {
      // because indices are base 1 let's just fill in the 0th data
      const objPositions = [[0, 0, 0]];
      const objTexcoords = [[0, 0]];
      const objNormals = [[0, 0, 0]];
      const objColors = [[0, 0, 0]];
    
      // same order as `f` indices
      const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
      ];
    
      // same order as `f` indices
      let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
      ];
    
      const materialLibs = [];
      const geometries = [];
      let geometry;
      let groups = ['default'];
      let material = 'default';
      let object = 'default';
    
      const noop = () => {};
    
      function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
          geometry = undefined;
        }
      }
    
      function setGeometry() {
        if (!geometry) {
          const position = [];
          const texcoord = [];
          const normal = [];
          const color = [];
          webglVertexData = [
            position,
            texcoord,
            normal,
            color,
          ];
          geometry = {
            object,
            groups,
            material,
            data: {
              position,
              texcoord,
              normal,
              color,
            },
          };
          geometries.push(geometry);
        }
      }
    
      function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
          if (!objIndexStr) {
            return;
          }
          const objIndex = parseInt(objIndexStr);
          const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
          webglVertexData[i].push(...objVertexData[i][index]);
          // if this is the position index (index 0) and we parsed
          // vertex colors then copy the vertex colors to the webgl vertex color data
          if (i === 0 && objColors.length > 1) {
            geometry.data.color.push(...objColors[index]);
          }
        });
      }
    
      const keywords = {
        v(parts) {
          // if there are more than 3 values here they are vertex colors
          if (parts.length > 3) {
            objPositions.push(parts.slice(0, 3).map(parseFloat));
            objColors.push(parts.slice(3).map(parseFloat));
          } else {
            objPositions.push(parts.map(parseFloat));
          }
        },
        vn(parts) {
          objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
          // should check for missing v and extra w?
          objTexcoords.push(parts.slice(0, 2).map(parseFloat));
        },
        f(parts) {
          setGeometry();
          const numTriangles = parts.length - 2;
          for (let tri = 0; tri < numTriangles; ++tri) {
            addVertex(parts[0]);
            addVertex(parts[tri + 1]);
            addVertex(parts[tri + 2]);
          }
        },
        s: noop,    // smoothing group
        mtllib(parts, unparsedArgs) {
          // the spec says there can be multiple filenames here
          // but many exist with spaces in a single filename
          materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
          material = unparsedArgs;
          newGeometry();
        },
        g(parts) {
          groups = parts;
          newGeometry();
        },
        o(parts, unparsedArgs) {
          object = unparsedArgs;
          newGeometry();
        },
      };
    
      const keywordRE = /(\w*)(?: )*(.*)/;
      const lines = text.split('\n');
      for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
          continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
          continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
          console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
          continue;
        }
        handler(parts, unparsedArgs);
      }
    
      // remove any arrays that have no entries.
      for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(([, array]) => array.length > 0));
      }
    
      return {
        geometries,
        materialLibs,
      };
  }

  function parseMTL(text) {
    const materials = {};
    let material;
  
    const keywords = {
      newmtl(parts, unparsedArgs) {
        material = {};
        materials[unparsedArgs] = material;
      },
      /* eslint brace-style:0 */
      Ns(parts)     { material.shininess      = parseFloat(parts[0]); },
      Ka(parts)     { material.ambient        = parts.map(parseFloat); },
      Kd(parts)     { material.diffuse        = parts.map(parseFloat); },
      Ks(parts)     { material.specular       = parts.map(parseFloat); },
      Ke(parts)     { material.emissive       = parts.map(parseFloat); },
      Ni(parts)     { material.opticalDensity = parseFloat(parts[0]); },
      d(parts)      { material.opacity        = parseFloat(parts[0]); },
      illum(parts)  { material.illum          = parseInt(parts[0]); },
    };
  
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      debugger;
      if (!handler) {
        console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
        continue;
      }
      handler(parts, unparsedArgs);
    }
  
    return materials;
  }

  /*@Autor : Martin Melendez Blas
  @ permite parsear el texto de lib*/
function parseLib(textLib) {


  var material = null;
  var materials = [];

  function setMaterial(parts) {
      material = {
          Kd:[0, 0 , 0],
          Ka:[0, 0, 0],
          Ks:[0, 0, 0],
          Ke:[0, 0, 0],
          Ni:0,
          Ns:0,
          d:0,
          illum:1.0,
          map_Kd:""
      };    
      
      materials[parts[0]] = material;
  }

  const keywords = {
      Kd(parts) {
          material.Kd = parts.map(parseFloat);
      },
      Ka(parts) {
        material.Ka = parts.map(parseFloat);
      },
      Ks(parts) {
        material.Ks = parts.map(parseFloat);
      },
      Ke(parts) {
        material.Ke = parts.map(parseFloat);
      },
      Ns(parts) {
        material.Ns = parseFloat(parts[0]);
      },
      Ni(parts) {
        material.Ni = parseFloat(parts[0]);
      },
      d(parts) {
        material.d = parseFloat(parts[0]);
      },
      illum(parts) {
          material.illum = parts[0];
      },
      map_Kd(parts) {
          material.map_Kd = parts[0] + "";
      },
      newmtl(parts) {
        setMaterial(parts);
        
      }

    };


  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = textLib.split('\n');
  
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword2, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword2];
    if (!handler) {
      console.warn('unhandled keyword:', keyword2);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  return materials;
};

  function parseOBJFile(objFileData) {

    var geometries = [];

    let geometry;

    function newGeometry() {
      // If there is an existing geometry and it's
      // not empty then start a new one.
      if (geometry && geometry.data.position.length) {
        geometry = undefined;
      }
    }
  
    function setGeometry() {
      if (!geometry) {
        const position = [];
        const texcoord = [];
        const normal = [];
        const color = [];
        webglVertexData = [
          position,
          texcoord,
          normal,
          color,
        ];
        geometry = {
          object,
          groups,
          material,
          data: {
            position,
            texcoord,
            normal,
            color,
          },
        };
        geometries.push(geometry);
      }
    }


    const vertexPositions = [];
    const vertexNormals = [];
    const textureCoords = [];
    const indices = [];
    const materials = {};
    let currentMaterial = null;
    let currentMesh = null;
  
    const lines = objFileData.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const elements = line.split(' ');
  
      if (elements[0] === 'v') {
        const x = parseFloat(elements[1]);
        const y = parseFloat(elements[2]);
        const z = parseFloat(elements[3]);
        vertexPositions.push(x, y, z);
      }
      else if (elements[0] === 'vn') {
        const nx = parseFloat(elements[1]);
        const ny = parseFloat(elements[2]);
        const nz = parseFloat(elements[3]);
        vertexNormals.push(nx, ny, nz);
      }
      else if (elements[0] === 'vt') {
        const u = parseFloat(elements[1]);
        const v = parseFloat(elements[2]);
        textureCoords.push(u, v);
      }
      else if (elements[0] === 'f') {
        for (let j = 1; j < elements.length; j++) {
          const faceData = elements[j].split('/');
          const vertexIndex = parseInt(faceData[0]) - 1;
          const textureCoordIndex = parseInt(faceData[1]) - 1;
          const normalIndex = parseInt(faceData[2]) - 1;
          indices.push(vertexIndex, textureCoordIndex, normalIndex);
        }
      }
      else if (elements[0] === 'usemtl') {
        const materialName = elements[1];
        currentMaterial = materials[materialName];
        if (!currentMaterial) {
          currentMaterial = { indices: [] };
          materials[materialName] = currentMaterial;
        }
        currentMesh = currentMaterial;
      }
      else if (elements[0] === 'mtllib') {
        const materialLibName = elements[1];
        // Load and parse the material library (if needed)
        // You can call a separate function to handle material parsing here
      }
      else if (elements[0] === 'newmtl') {
        const materialName = elements[1];
        currentMaterial = { indices: [] };
        materials[materialName] = currentMaterial;
      }
      else if (elements[0] === 'Ka') {
        // Ambient color for the current material
        const r = parseFloat(elements[1]);
        const g = parseFloat(elements[2]);
        const b = parseFloat(elements[3]);
        // Assign ambient color to the current material
        currentMaterial.ambientColor = [r, g, b];
      }
      else if (elements[0] === 'Kd') {
        // Diffuse color for the current material
        const r = parseFloat(elements[1]);
        const g = parseFloat(elements[2]);
        const b = parseFloat(elements[3]);
        // Assign diffuse color to the current material
        currentMaterial.diffuseColor = [r, g, b];
      }
      else if (elements[0] === 'Ks') {
        // Specular color for the current material
        const r = parseFloat(elements[1]);
        const g = parseFloat(elements[2]);
        const b = parseFloat(elements[3]);
        // Assign specular color to the current material
        currentMaterial.specularColor = [r, g, b];
      }
    }
  
    return {
      vertexPositions,
      vertexNormals,
      textureCoords,
      indices
    };
  }

  /**
   * 
   */
  
  /**
   * Create a simple mesh from vertices and indices
   * @param {WebGL2RenderingContext} gl Context of WebGL to render
   * @param {Float32Array} vertices Vertices of the model
   * @param {Uint16Array} indices Indices of the model
   * @param {dictionary} vertexFormat Vertex format of the model
   * @returns the static mesh
   */
  function createMesh(gl, vertices, indices, vertexFormat){
    var mesh = new StaticMesh();

    gl.bindVertexArray(mesh.getVao());

    var vbo = createBuffer(gl);
    var ibo = createBuffer(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    var submesh = new Submesh();
    submesh.setVertexBuffer(vbo);
    submesh.setIndexBuffer(ibo);
    submesh.setNumIndices(indices.length);
    submesh.setNumVertices(vertices.length);
    
    mesh.setVertexFormat(vertexFormat);

    mesh.addSubmesh(submesh);

    return mesh;
  }

  /**
   * Create a mesh from OBJ file
   * @param {WebGL2RenderingContext} gl Context of WebGL to render
   * @param {string} filename Path + name file of the obj file
   * @returns {StaticMesh} mesh
   */
  async function createMeshByObjFile(gl, filename){
    var obj = await loadFileObj(filename);

    var mesh = new StaticMesh();

    /** Load Materials */
    var basePath = "";
    var index = filename.length;
    while(filename[index] != "/")
      index--;
    basePath = filename.substring(0, index + 1);

    var materials = [];
    for(var i = 0; i < obj.materialLibs.length; i++){
      let response = await fetch(basePath + obj.materialLibs[i]);
      let text = await response.text();
      materials = parseLib(text);
    }

    var dicmat = {};
    for(var m in materials){
      //debugger;
      const mat = materials[m];

      var material = new Material();
      material.setName(m.toString());
      material.setAmbientColor(mat.Ka);
      material.setDiffuseColor(mat.Kd);
      material.setSpecularColor(mat.Ks);
      material.setEmissiveColor(mat.Ke);
      material.setTransparency(mat.d)
      material.setSpecularPower(mat.Ns);
      material.setOpticalDensity(mat.Ni);

      dicmat[material.getName()] = mesh.getNumMaterials();

      mesh.addMaterial(material);
    }
    debugger;

    /** Load geometry */
    gl.bindVertexArray(mesh.getVao());

    for(var i = 0; i < obj.geometries.length; i++){
      var vertices = [];
      var numVertices = obj.geometries[i].data.position.length / 3;
      var iTex = 0;

      for(var j = 0; j < obj.geometries[i].data.position.length; j += 3){
        vertices.push(obj.geometries[i].data.position[j]);
        vertices.push(obj.geometries[i].data.position[j + 1]);
        vertices.push(obj.geometries[i].data.position[j + 2]);
        vertices.push(obj.geometries[i].data.texcoord[iTex++]);
        vertices.push(obj.geometries[i].data.texcoord[iTex++]);
        vertices.push(obj.geometries[i].data.normal[j]);
        vertices.push(obj.geometries[i].data.normal[j + 1]);
        vertices.push(obj.geometries[i].data.normal[j + 2]);
      }

      var vbo = webGLengine.createBuffer(gl);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

      var submesh = new Submesh();
      submesh.setVertexBuffer(vbo);
      submesh.setNumVertices(numVertices);
      submesh.setMaterialIndex(dicmat[obj.geometries[i].material]);

      mesh.addSubmesh(submesh);
    }
    debugger;
    gl.bindVertexArray(null);

    var vertexFormat = { "in_position" : 3, "in_texcoord" : 2, "in_normal" : 3 };
    mesh.setVertexFormat(vertexFormat);

    return mesh;
  }

    return {
        initWebGL : initWebGL, 
        createProgram : createProgram,
        createShader : createShader,
        resizeCanvasToDisplaySize : resizeCanvasToDisplaySize,
        getAttributeLocation : getAttributeLocation,
        getUniformLocation : getUniformLocation,
        radianToDegree : radianToDegree,
        degreeToRadian : degreeToRadian,
        parseOBJ : parseOBJ,
        loadFileObj : loadFileObj,
        parseOBJFile : parseOBJFile,
        createBuffer : createBuffer,
        //Object Engine
        createMesh : createMesh,
        createMeshByObjFile : createMeshByObjFile
    }

    })
);