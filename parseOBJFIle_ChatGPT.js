function parseOBJFile(objFileData) {
  const vertexPositions = [];
  const vertexNormals = [];
  const textureCoords = [];
  const indices = [];
  const materials = {};
  let currentMaterial = null;
  let currentGroup = null;

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
      currentGroup.material = currentMaterial;
    }
    else if (elements[0] === 'g') {
      const groupName = elements.slice(1).join(' ');
      currentGroup = { name: groupName, material: null };
      currentMaterial = null;
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
    // ... Continue parsing other material properties as needed
  }

  return {
    vertexPositions,
    vertexNormals,
    textureCoords,
    indices,
    materials
  };
}
