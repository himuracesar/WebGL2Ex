
(function(root, factory){
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
          return factory.call(root);
        });
      } else {
        // Browser globals
        root.webglengine = factory.call(root);
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
        else {
          return gl;
        }
      }

      function createShader(gl, type, source) {
        var shader = gl.createShader(type);
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

    return {
        initWebGL : initWebGL, 
        createProgram : createProgram,
        createShader : createShader
    }

    })
);