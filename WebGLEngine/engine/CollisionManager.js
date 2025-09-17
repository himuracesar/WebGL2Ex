/**
 * Manage the collisions of the game
 * @author César Himura
 * @version 1.0
 */
class CollisionManager {
    /**
     * Make an instance of collision manager
     */
    constructor() {
        this.groups = null;
        this.relations = [];
        this.running = false;
        this.checkRate = 0; //milliseconds
        this.nextCheck = (new Date()).getTime() + this.checkRate;
    }

    /**
     * Add an element to a collision group. If the group doesn't exist makes it.
     * The group is a simple list inside of collision manager.
     * @param {Object} object Collisionable object
     * @param {string} groupName Name of the group
     */
    addElementToGroup(object, groupName) {
        if(this.groups == null){
            this.groups = new Map();
        }

        if(this.groups.get(groupName) === undefined){
            var grp = [];
            this.groups.set(groupName, grp);
        }

        this.groups.get(groupName).push(object);
    }

    /**
     * Delete an element od a group
     * @param {int} index The index of the element
     * @param {string} groupName Group's name
     */
    deleteElementInGroup(index, groupName) {
        this.groups.get(groupName).splice(index, 1);
    }

    /**
     * Add a relation for collision groups. It means that all group1's elements are collisionable
     * with all group2's elements
     * @param {string} group1 Name of the group 1
     * @param {string} group2 Name of the group 2 
     */
    addCollisionRelation(group1, group2) {
        var rel = [ group1, group2 ];
        this.relations.push(rel);
    }

    async checkCollisions() {
        //debugger;
        if(this.running)
            return;

        if((new Date()).getTime() > this.nextCheck)
            this.nextCheck = this.checkRate + (new Date()).getTime();
        else
            return;

        this.running = true;

        /*if(this.messages == null)
            this.messages = new Map();*/

        for(const rel of this.relations){
            var gp1 = this.groups.get(rel[0]);
            var gp2 = this.groups.get(rel[1]);
            //debugger;
            for(var i = 0; i < gp1.length; i++){
                const e1 = gp1[i];

                if(webGLengine.getMessages(e1.getID()) !== undefined)
                    continue;
                    
                for(var j = 0; j < gp2.length; j++){
                    const e2 = gp2[j];

                    if(webGLengine.getMessages(e2.getID()) !== undefined)
                        continue;

                    var sumRadios = e1.getBounding().getRadio() + e2.getBounding().getRadio();

                    const e1pos = e1.getBounding().getPosition();
                    const e2pos = e2.getBounding().getPosition();
                    var distance = Math.sqrt(Math.pow(e2pos[0] - e1pos[0], 2) + Math.pow(e2pos[1] - e1pos[1], 2) + Math.pow(e2pos[2] - e1pos[2], 2));

                    if(distance < sumRadios){
                        var msg = '{"event": "collision", "from":' + '"' + e2.getID() + '"}';
                        webGLengine.addMessage(e1.getID(), msg);
                        webGLengine.addObjectInCollision(e2.getID(), e2);

                        msg = '{"event": "collision", "from":' + '"' + e1.getID() + '"}';
                        webGLengine.addMessage(e2.getID(), msg);
                        webGLengine.addObjectInCollision(e1.getID(), e1);

                        //console.log("collision!");
                    }
                }
            }
        }
        //debugger;
        this.running = false;
    }   
}