/**
 * Player of the game
 * @author César Himura
 * @version 1.0
 */
class Player extends Actor {
    constructor(){
        super();

        this.id = "invader";
        this.mesh = null;
        this.position = [0.0, 10.0, 100.0];
        this.speed = 4.0;
        this.collider = new BoundingSphere({ radio: 20.0, position: this.position });

        var fnMesh = webGLengine.createMeshByObjFile(gl, "meshes/player.obj");
        fnMesh.then((staticMesh) => {
            this.mesh = staticMesh;
            this.mesh.setPosition(this.position);
        });

        this.bullets = [];
        this.fireRate = 140.0; //milliseconds
        this.nextFire = 0.0;
    }

    /**
     * Update all logic  data
     */
    update(){
        super.processMessages();

        if(this.bullets[0] != null){
            var t = (new Date()).getTime() - this.bullets[0].getBirthTime();
            if(t >= this.bullets[0].getLifespan()){
                this.bullets[0] = null;
                this.bullets.shift();
                
                cm.deleteElementInGroup(1, "player");
            }
        }

        for(var i = 0; i < this.bullets.length; i++){
            var bullet = this.bullets[i];
            bullet.update();
            //bullet.render(cookTorrancePipeline);

            if(bullet.getStatus() == BulletPlayer.Status.DEATH){
                this.bullets.splice(i, 1);
                cm.deleteElementInGroup(i+1, "player");
            }
        }
    }

    /**
     * Render the player
     * @param {Pipeline} pipeline 
     */
    render(pipeline){
        if(this.mesh != null)
            this.mesh.render(pipeline);

        /*this.mesh
            .then(() => {console.log("fulfilled");}) 
            .catch(() => {console.log("rejected");})*/
        
        //this.bounding.render(axisPipeline);

        for(var i = 0; i < this.bullets.length; i++){
            var bullet = this.bullets[i];
            bullet.render(pipeline);
        }
    }

    /**
     * Shot a bullet
     */
    shot() {
        if((new Date()).getTime() > this.nextFire){
            this.nextFire = this.fireRate + (new Date()).getTime();

            var bullet = new BulletPlayer("bullet");
            bullet.setPosition(this.getPosition());
            bullet.setDirection(this.getForward());

            this.bullets.push(bullet);

            cm.addElementToGroup(bullet, "player");
        }
    }

    /**
     * This is triggering when the object is on collision
     * @param {Object} object Object with 
     */
    onCollision(object) {
        console.log("Player collision!");
    }
}