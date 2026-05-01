
class GridPipeline extends Pipeline {
    constructor(){
        var vertexShaderSrc = `#version 300 es
            precision highp float;

            out vec2 uv;
            out vec2 out_camPos;

            // --- GridParameters.h inlineado ---
            float gridSize                    = 1000.0f;
            float gridCellSize                = 0.025f;
            vec4  gridColorThin               = vec4(0.5, 0.5, 0.5, 1.0);
            vec4  gridColorThick              = vec4(0.0, 0.0, 0.0, 1.0);
            const float gridMinPixelsBetweenCells = 2.0f;
            // ----------------------------------

            /*layout(std140) uniform PerFrameData {
                mat4 MVP;
                vec4 cameraPos;
                vec4 origin;
            };*/

            uniform mat4 u_mProj;
            uniform mat4 u_mView;
            uniform vec3 u_cameraPos;
            uniform vec3 u_origin;

            const vec3 pos[4] = vec3[4](
                vec3(-1.0, 0.0, -1.0),  //0
                vec3( 1.0, 0.0, -1.0),  //1
                vec3( 1.0, 0.0,  1.0),  //2
                vec3(-1.0, 0.0,  1.0)   //3
            );

            //const int indices[6] = int[6](0, 1, 2, 2, 3, 0);
            const int indices[6] = int[6](0, 3, 2, 2, 1, 0);

            void main() {
                int idx          = indices[gl_VertexID];
                vec3 position    = pos[idx] * gridSize;
                position.x      += u_cameraPos.x;
                position.z      += u_cameraPos.z;
                position        += u_origin.xyz;
                out_camPos       = u_cameraPos.xz;
                gl_Position      = u_mProj * u_mView * vec4(position, 1.0);
                uv               = position.xz;
            }
        `;

        var fragmentShaderSrc = `#version 300 es
            precision highp float;

            // --- GridParameters.h inlineado ---
            float gridSize                        = 100.0;
            float gridCellSize                    = 0.025;
            vec4  gridColorThin                   = vec4(0.5, 0.5, 0.5, 1.0);
            vec4  gridColorThick                  = vec4(0.0, 0.0, 0.0, 1.0);
            const float gridMinPixelsBetweenCells = 2.0;
            // ----------------------------------

            // --- GridCalculation.h inlineado ---
            float log10(float x) {
                return log(x) / log(10.0);
            }

            float satf(float x) {
                return clamp(x, 0.0, 1.0);
            }

            vec2 satv(vec2 x) {
                return clamp(x, vec2(0.0), vec2(1.0));
            }

            float max2(vec2 v) {
                return max(v.x, v.y);
            }

            vec4 gridColor(vec2 uv, vec2 camPos) {
                vec2 dudv = vec2(
                    length(vec2(dFdx(uv.x), dFdy(uv.x))),
                    length(vec2(dFdx(uv.y), dFdy(uv.y)))
                );

                float lodLevel = max(0.0, log10((length(dudv) * gridMinPixelsBetweenCells) / gridCellSize) + 1.0);
                float lodFade  = fract(lodLevel);

                float lod0 = gridCellSize * pow(10.0, floor(lodLevel));
                float lod1 = lod0 * 10.0;
                float lod2 = lod1 * 10.0;

                dudv *= 4.0;
                uv   += dudv * 0.5;

                float lod0a = max2(vec2(1.0) - abs(satv(mod(uv, lod0) / dudv) * 2.0 - vec2(1.0)));
                float lod1a = max2(vec2(1.0) - abs(satv(mod(uv, lod1) / dudv) * 2.0 - vec2(1.0)));
                float lod2a = max2(vec2(1.0) - abs(satv(mod(uv, lod2) / dudv) * 2.0 - vec2(1.0)));

                uv -= camPos;

                // El operador ternario anidado es válido en GLSL ES 3.00
                vec4 c = lod2a > 0.0 ? gridColorThick
                        : lod1a > 0.0 ? mix(gridColorThick, gridColorThin, lodFade)
                        : gridColorThin;

                float opacityFalloff = (1.0 - satf(length(uv) / gridSize));

                c.a *= (lod2a > 0.0 ? lod2a
                        : lod1a > 0.0 ? lod1a
                        : (lod0a * (1.0 - lodFade))) * opacityFalloff;

                return c;
            }
            // ----------------------------------

            in  vec2 uv;
            in  vec2 out_camPos;
            out vec4 color;

            void main() {
                color = gridColor(uv, out_camPos);
                //color = vec4(gridColor(uv, out_camPos).xyz, 1.0);
                //color = vec4(1.0f, 1.0f, 0.0f, 1.0f);
            }
        `;
        
        let vertexFormat = {};

        super(gl, vertexShaderSrc, fragmentShaderSrc, vertexFormat);

        let attributes = new Map();
        
        /*var in_position = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_position");
        var in_color = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_color");
        var in_mModel = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_mModel");

        attributes.set("in_position", in_position);
        attributes.set("in_color", in_color);
        attributes.set("in_mModel", in_mModel);*/

        this.attributes = attributes;

        let uniforms = new Map();

        var u_mProj = gl.getUniformLocation(this.getProgram(), "u_mProj");
        var u_mView = gl.getUniformLocation(this.getProgram(), "u_mView");
        var u_cameraPos = gl.getUniformLocation(this.getProgram(), "u_cameraPos");
        var u_origin = gl.getUniformLocation(this.getProgram(), "u_origin");

        uniforms.set("u_mProj", u_mProj);
        uniforms.set("u_mView", u_mView);
        uniforms.set("u_cameraPos", u_cameraPos);
        uniforms.set("u_origin", u_origin);

        this.uniforms = uniforms;
    }

    /**
     * Get the attribute location of the shaders
     * @param {string} attribute Name of the attribute
     * @returns {GLint} attribute location
     */
    getAttributeLocation(attribute){
        return this.attributes.get(attribute);
    }

    /**
     * Get the uniform location of the shaders
     * @param {string} uniform Name of the uniform
     * @returns {GLint} uniform location
     */
    getUniformLocation(uniform){
        return this.uniforms.get(uniform);
    }
}