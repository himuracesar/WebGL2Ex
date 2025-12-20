/**
 * Texture
 * @author César Himura
 */
class Texture {

    /**
     * Target's name
     */
    /*static TargetNames = Object.freeze({
        Texture2D : gl.TEXTURE_2D,
        CubeMap : gl.TEXTURE_CUBE_MAP,
        Texture3D : gl.TEXTURE_3D,
        Texture2DArray : gl.TEXTURE_2D_ARRAY
    });*/

    /**
     * Param's names for texparameter[i][f] function 
     */
    /*static ParamNames = Object.freeze({
        MagFilter : gl.TEXTURE_MAG_FILTER,
        MinFilter : gl.TEXTURE_MIN_FILTER,
        WrapS : gl.TEXTURE_WRAP_S,
        WrapT : gl.TEXTURE_WRAP_T,
        BaseLevel : gl.TEXTURE_BASE_LEVEL,
        CompareFunc : gl.TEXTURE_COMPARE_FUNC,
        CompareMode : gl.TEXTURE_COMPARE_MODE,
        MaxLevel : gl.TEXTURE_MAX_LEVEL,
        MaxLod : gl.TEXTURE_MAX_LOD,
        MinLod : gl.TEXTURE_MIN_LOD,
        WrapR : gl.TEXTURE_WRAP_R
    });*/

    /**
     * Param's values for texparameter[i][f] function
     */
    /*static ParamValues = Object.freeze({
        Linear : gl.LINEAR, 
        Nearest : gl.NEAREST, 
        NearestMipmapNearest : gl.NEAREST_MIPMAP_NEAREST, 
        LinearMipmapearest : gl.LINEAR_MIPMAP_NEAREST, 
        NearestMipmapLinear : gl.NEAREST_MIPMAP_LINEAR, 
        LinearMipmapLinear : gl.LINEAR_MIPMAP_LINEAR,
        Repeat : gl.REPEAT, 
        ClampToEdge : gl.CLAMP_TO_EDGE, 
        MirroredRepeat : gl.MIRRORED_REPEAT,
        Lequal : gl.LEQUAL, 
        Gequal : gl.GEQUAL, 
        Less : gl.LESS, 
        Greater : gl.GREATER, 
        Equal : gl.EQUAL, 
        Notequal : gl.NOTEQUAL, 
        Always : gl.ALWAYS, 
        Never : gl.NEVER,
        None : gl.NONE, 
        CompareRefToTexture : gl.COMPARE_REF_TO_TEXTURE
    });*/

    constructor(){
        this.texture = null;
    }

    /**
     * Get the WebGLTexture
     * @returns {WebGLTexture} texture of WebGL
     */
    getWebGLTexture(){
        return this.texture;
    }

    /**
     * Set a WebGLTexture
     * @param {WebGLTexture} texture Texture of WebGL
     */
    setWebGLTexture(texture){
        this.texture = texture;
    }
}