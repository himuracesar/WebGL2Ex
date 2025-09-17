/**
 * Ray to execute ray cast
 * 
 * @author César Himura
 * @version 1.0
 */
class Ray {
    constructor(origin, direction){
        this.origin = origin;
        this.direction = direction;
    }

    /**
     * Get the origin of the ray
     * @returns {Vector3} Origin of the ray
     */
    getOrigin(){
        return this.origin;
    }

    /**
     * Get the direction of the ray
     * @returns {Vector3} Direction of the ray
     */
    getDirection(){
        return this.direction;
    }
}