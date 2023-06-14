
'use strict'

var vertexShaderSource = `#version 300 es
    in vec3 a_position;
    in vec4 a_color;

    uniform mat4 u_mWVP;

    out vec4 v_color;

    void main()
    {
        gl_Position = u_mWVP * vec4(a_position, 1.0);
        //gl_Position = vec4(a_position, 1.0) * u_mWVP;
        v_color = a_color;
    }
`;

var fragmentShaderSource = `#version 300 es
    precision highp float;

    in vec4 v_color;

    out vec4 fragColor;

    void main()
    {
        fragColor = v_color;
    }
`;

function main(){
    var canvas = document.querySelector("#canvas");
    var gl = webglengine.initWebGL(canvas);

    var cubeVertices = [
        //Front
        -1.0, -1.0,  1.0, 1.0, 0.0, 0.0, 1.0, //0
         1.0, -1.0,  1.0, 1.0, 0.0, 0.0, 1.0, //1
         1.0,  1.0,  1.0, 1.0, 0.0, 0.0, 1.0, //2
        -1.0,  1.0,  1.0, 1.0, 0.0, 0.0, 1.0, //3
        //Letf
         1.0, -1.0,  1.0, 0.0, 1.0, 0.0, 1.0, //4
         1.0, -1.0, -1.0, 0.0, 1.0, 0.0, 1.0, //5
         1.0,  1.0, -1.0, 0.0, 1.0, 0.0, 1.0, //6
         1.0,  1.0,  1.0, 0.0, 1.0, 0.0, 1.0, //7
        //Back
         1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0, //8
        -1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0, //9
        -1.0,  1.0, -1.0, 0.0, 0.0, 1.0, 1.0, //10
         1.0,  1.0, -1.0, 0.0, 0.0, 1.0, 1.0, //11
        //Right
        -1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0, //12
        -1.0, -1.0,  1.0, 1.0, 1.0, 0.0, 1.0, //13
        -1.0,  1.0,  1.0, 1.0, 1.0, 0.0, 1.0, //14
        -1.0,  1.0, -1.0, 1.0, 1.0, 0.0, 1.0, //15
        //Top
        -1.0,  1.0,  1.0, 1.0, 0.0, 1.0, 1.0, //16
         1.0,  1.0,  1.0, 1.0, 0.0, 1.0, 1.0, //17
         1.0,  1.0, -1.0, 1.0, 0.0, 1.0, 1.0, //18
        -1.0,  1.0, -1.0, 1.0, 0.0, 1.0, 1.0, //19
        //Bottom
        -1.0, -1.0, -1.0, 0.0, 1.0, 1.0, 1.0, //20
         1.0, -1.0, -1.0, 0.0, 1.0, 1.0, 1.0, //21
         1.0, -1.0,  1.0, 0.0, 1.0, 1.0, 1.0, //22
        -1.0, -1.0,  1.0, 0.0, 1.0, 1.0, 1.0  //23
    ];

    var indices = [
        //Front
        0, 1, 2, 0, 2, 3,
        //Right
        4, 5, 6, 4, 6, 7,
        //Back
        8, 9, 10, 8, 10, 11,
        //Left
        12, 13, 14, 12, 14, 15,
        //Top
        16, 17, 18, 16, 18, 19,
        //Bottom
        20, 21, 22, 20, 22, 23
    ];

    var vertexShader = webglengine.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = webglengine.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    var program = webglengine.createProgram(gl, vertexShader, fragmentShader);
     
    var meshBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    var mWVPAttributeLocation = gl.getUniformLocation(program, "u_mWVP");

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);

    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  
    // First let's make some variables
    // to hold the translation,
    var fieldOfViewRadians = degToRad(60);

    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('keydown', onKeyDown, false);

    var angleY = 0.0;
    var angleX = 0.0;

    function radToDeg(r) {
      return r * 180 / Math.PI;
    }
  
    function degToRad(d) {
      return d * Math.PI / 180;
    }

    function onKeyUp(event)
    {
      /* if(event.key == 'd')
        angleY = angleY + 10.0;

      render(); */
      //alert("OnKeyUp:: " + angleY);
    }

    function onKeyDown(event)
    {
        if(event.key == 'd')
          angleY = angleY + 10.0;
        else if(event.key == 'a')
          angleY = angleY - 10.0;

        if(event.key == 'w')
          angleX = angleX + 10.0;
        else if(event.key == 's')
          angleX -= 10.0;

        angleX = (angleX >= 360.0) ? angleX - 360.0 : angleX;

        console.log("angleX:: " + angleX);

        render();
    }

    render();

    function render(){
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0.0, 0.0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.depthFunc(gl.LEQUAL);
        gl.cullFace(gl.BACK);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        // Compute the matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        // Compute the position of the first F
        var target = [0.0, 0.0, 0.0];

        // Use matrix math to compute a position on the circle.
        var cameraMatrix = m4.identity();
        //cameraMatrix = m4.yRotate(cameraMatrix, degToRad(angleY));
        cameraMatrix = m4.xRotate(cameraMatrix, degToRad(angleX));
        cameraMatrix = m4.translate(cameraMatrix, 0.0, 0.0, 10.0);

        // Get the camera's postion from the matrix we computed
        var cameraPosition = [
          cameraMatrix[12],
          cameraMatrix[13],
          cameraMatrix[14]
        ]; 

        var up = [0, 1, 0];
        //var cameraPosition = [0.0, 0.0, 10.0];

        // Compute the camera's matrix using look at.
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        // create a viewProjection matrix. This will both apply perspective
        // AND move the world so that the camera is effectively the origin
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
        //var viewProjectionMatrix = m4.multiply(projectionMatrix, cameraMatrix);

        // Set the matrix.
        gl.uniformMatrix4fv(mWVPAttributeLocation, false, viewProjectionMatrix);

        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
}

main();