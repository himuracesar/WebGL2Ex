
class Player{
    constructor(){
        this.mesh = null;
        this.position = [0.0, 0.0, 100.0];
        this.angle = 0.0;//Math.PI / 2.0;

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
            this.angle = a;// - Math.PI / 2.0;
            this.mesh.rotateY(this.angle);
        }
    }

    setPosition(position){
        this.position = position;
        if(this.mesh != null)
            this.mesh.setPosition(this.position);
    }

    getPosition(){
        return this.position;
    }

    /**
     * Get the forward vector
     * @returns {Vector3} Forward vector
     */
    getForward(){
        if(this.mesh != null)
            return this.mesh.getForward();

        return [0.0, 0.0, -1.0];
    }

    /**
     * Get the right vector
     * @returns {Vector3} Right vector
     */
    getRight(){
        if(this.mesh != null)
            return this.mesh.getRight();

        return [1.0, 0.0, 0.0];
    }

    /**
     * Get the up vector
     * @returns {Vector3} Up vector
     */
    getUp(){
        if(this.mesh != null)
            return this.mesh.getUp();

        return [0.0, 1.0, 0.0];
    }

    rotateAxis(m){
        if(this.mesh != null)
            this.mesh.rotateAxis(m);
    }
}