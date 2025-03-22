
class Player{
    constructor(){
        this.mesh = null;
        this.position = [0.0, 0.0, 100.0];
        this.angle = 0.0;

        var fnMesh = webGLengine.createMeshByObjFile(gl, "meshes/player.obj");
        fnMesh.then((staticMesh) => {
            this.mesh = staticMesh;
            this.mesh.setPosition(this.position);
        });
    }

    render(pipeline){
        //debugger;
        if(this.mesh != null)
            this.mesh.render(pipeline);
        
        /*this.mesh
            .then(() => {console.log("fulfilled");}) 
            .catch(() => {console.log("rejected");})*/
    }

    translate([x, y, z]){
        this.position = [this.position[0] + x, this.position[1] + y, this.position[2] + z];
        if(this.mesh != null)
            this.mesh.setPosition(this.position);
    }

    rotateY(a){
        if(this.mesh != null){
            this.angle += a;
            this.mesh.rotateY(this.angle);
        }
    }

    setPosition(position){
        this.position = position;
        if(this.mesh != null)
            this.mesh.setPosition(this.position);
    }
}