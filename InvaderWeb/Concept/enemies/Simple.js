
class Simple extends Actor{

    constructor(idMesh){
        super();

        this.mesh = webGLengine.getResource(idMesh);
        this.mesh.rotateY(webGLengine.degreeToRadian(180.0));
        this.position = [0.0, 10.0, 0.0];
        this.mesh.setPosition(this.position);
        this.speed = 2.0;
        this.bullets = [];
        this.fireRate = 350.0; //milliseconds
        this.nextFire = 0.0;

        this.collider = new SphereBounding({ radio: 20.0, position: this.position });

        this.id = "Enemy-Simple";
        this.inDamage = false;
        this.lastInDamage = 90; //milliseconds
        this.completedInDamage = 0;
    }

    /**
     * Update all logic  data
     */
    update(){
        super.processMessages();

        if(this.inDamage && this.completedInDamage < (new Date()).getTime()){
            this.inDamage = false;
            this.mesh.setMaterial(0, m_fucsia);
        }

        if(this.bullets[0] != null){
            var t = (new Date()).getTime() - this.bullets[0].getBirthTime();
            if(t >= this.bullets[0].getLifespan()){
                this.bullets[0] = null;
                this.bullets.shift();
                
                cm.deleteElementInGroup(1, "enemies");
            }
        }

        for(var i = 0; i < this.bullets.length; i++){
            var bullet = this.bullets[i];
            bullet.update();

            if(bullet.getStatus() == BulletEnemy.Status.DEATH){
                this.bullets.splice(i, 1);
                cm.deleteElementInGroup(i+1, "enemies");
            }
        }
        
        this.point();
        //this.shot();
    }

    /**
     * Render the enemy
     * @param {Pipeline} pipeline 
     */
    render(pipeline){
        if(this.mesh != null){
            this.mesh.render(pipeline);
        }

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

            var bullet = new BulletEnemy("bullet");
            bullet.setPosition(this.getPosition());
            bullet.setDirection(this.getForward());

            this.bullets.push(bullet);

            cm.addElementToGroup(bullet, "enemies");
        }
    }

    /**
     * Point to the player for shot
     */
    point() {
        var direction = m4.normalize(m4.subtractVectors(this.position, player.getPosition()));
        var angle = Math.acos(m4.dot([1.0, 0.0, 0.0], direction));

        if(player.getPosition()[2] < this.position[2])
            angle = -angle;

        var m = m4.axisRotation([0.0, 1, 0.0], angle - Math.PI / 2);

        this.rotationAxis(m);
    }

    onCollision(object){
        super.onCollision(object);
        this.mesh.setMaterial(0, m_damage);
        this.inDamage = true;

        this.completedInDamage = (new Date()).getTime() + this.lastInDamage;
    }
}