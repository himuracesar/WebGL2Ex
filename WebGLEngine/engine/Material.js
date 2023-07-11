/**
 * 
 */
class Material {

    constructor() {
        this.name = "";
        this.ambientColor = [0.0, 0.0, 0.0];
        this.diffuseColor = [0.0, 0.0, 0.0];
        this.specularColor = [0.0, 0.0, 0.0];
        this.emissiveColor = [0.0, 0.0, 0.0];
        this.specularPower = 0.0;
        this.transparency = 1;
        this.opticalDensity = 1; //Ni obj file
        this.diffuseTextureIndex = -1;
        this.normalMapIndex = -1;
        this.bumpMapIndex = -1;
        this.roughness = 0.0;
        this.metallness = 0.0;
    }

    setName(name){
        this.name = name;
    }

    setAmbientColor(color){
        this.ambientColor = color;
    }

    setDiffuseColor(color){
        this.diffuseColor = color;
    }

    setEmissiveColor(color){
        this.emissiveColor = color;
    }

    setSpecularColor(color){
        this.specularColor = color;
    }

    setSpecularPower(power){
        this.specularPower = power;
    }

    setTransparency(tr){
        this.transparency = tr;
    }

    setOpticalDensity(od){
        this.opticalDensity = od;
    }

    setDiffuseTextureIndex(index){
        this.diffuseTextureIndex = index;
    }

    setNormalMapIndex(index){
        this.normalMapIndex = index;
    }

    setBumpMapIndex(index){
        this.normalMapIndex = index;
    }

    setBumpMapIndex(index){
        this.bumpMapIndex = index;
    }

    setRoughness(roughness){
        this.roughness = roughness;
    }

    setMetallness(metallness){
        this.metallness = metallness;
    }

    /**
     * Get the material name
     * @returns material name
     */
    getName(){
        return this.name;
    }
}