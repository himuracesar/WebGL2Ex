
class Simple extends Actor{

    constructor(idMesh){
        super();

        this.mesh = webGLengine.getResource(idMesh);
        this.position = [0.0, 10.0, 0.0];
        this.mesh.setPosition(this.position);

        this.bounding = new SphereBounding({ radio: 20.0, position: this.position });

        this.id = "Enemy-Simple";
    }

    /**
     * Render the enemy
     * @param {Pipeline} pipeline 
     */
    render(pipeline){
        super.processMessages();

        if(this.mesh != null)
            this.mesh.render(pipeline);

        this.bounding.render(axisPipeline);
    }
}