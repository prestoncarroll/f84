import Vector2 from './math/Vector2.js';

export default class Entity
{
    /**
     * Entity is the core building block of this engine. Entities have basic transform and parent properties that can be manipulated. Components can be added to entities that will allow you to display and affect the entity.
     * @constructs Entity
     * @param {Scene} scene - The scene the entity is a part of
     * @param {Number} x  - The x coordinate.
     * @param {Number} y  - The y coordinate.
     */
    constructor(scene, x, y)
    {
        /** 
         * This is the scene the Entity is attached to. An entity must be attached to a scene in order to update and render properly.
         * @public
         * @type {Scene} 
         * @member Entity#scene
         */
        this.scene = scene;
        this.scene.entities.push(this);
        /** 
         * This is the local position of the entity relative to it's parent. If there is no parent, the local position is relative to the top left of the canvas
         * @public
         * @type {Vector2} 
         * @member Entity#localPosition
         */
        this.localPosition = new Vector2(x, y);
        /** 
         * This is the local rotation in degrees of the entity relative to it's parent.
         * @public
         * @type {Number} 
         * @member Entity#localRotation
         */
        this.localRotation = 0;
        /** 
         * This is the local scale of the entity relative to it's parent. X & Y can be scaled independently.
         * @public
         * @type {Vector2} 
         * @member Entity#localScale
         */
        this.localScale = new Vector2(1, 1);
        /** 
         * This is an array of components added to the entity. These components are updated and rendered every frame.
         * @public
         * @type {Array} 
         * @member Entity#components
         */
        this.components = [];
        /** 
         * This is an array of child entities added to the entity. These entities have their transform properties affected by their parent. Unlike components, updating and rendering child entities is controlled by the scene and not the parent entity.
         * @public
         * @type {Array} 
         * @member Entity#children
         */
        this.children = [];
        /** 
         * This is the parent Entity that this Entity is parented to. By default, entities do not have a parent.
         * @public
         * @type {Enity} 
         * @member Entity#parent
         */
        this.parent = null;
        /** 
         * Destroyed is set to true when destroy() is called. This boolean is used to properly remove the entity from the associated scene's entity list
         * @public
         * @type {Boolean} 
         * @member Entity#destroyed
         */
        this.destroyed = false;
    }

    /**
     *  This recursively loops through all parents of the entity. As it loops it applies offsets for position, scale, and rotation in order to accurately return a world position value relative to the top left of the canvas 
     *  @instance
     *  @memberof Entity
     *  @returns {Vector2} position
     */
    getPosition()
    {
        const position = this.localPosition.clone();
        let parent = this.parent;
        while(parent != null)
        {
            position.multiply(parent.localScale);
            const tx = position.x;
            const ty = position.y;
            const sin = Math.sin(parent.localRotation * Math.PI/180);
            const cos = Math.cos(parent.localRotation * Math.PI/180);
            position.x = (cos*tx)-(sin*ty);
            position.y = (sin*tx)+(cos*ty);
            position.x += parent.localPosition.x
            position.y += parent.localPosition.y;
            parent = parent.parent;
        }
        return position;
    }

    /**
     *  This recursively loops through all parents of the entity to determine it's world rotation in degrees.
     *  @instance
     *  @memberof Entity
     *  @returns {Number} rotation
     */
    getRotation()
    {
        let rotation = this.localRotation;
        let parent = this.parent;
        while(parent != null)
        {
            rotation += parent.localRotation;
            parent = parent.parent;
        }
        return rotation;
    }

    /**
     * This recursively loops through all parents of the entity to determine its x & y world scale.
     * @instance
     * @memberof Entity
     * @returns {Vector2} scale
     */
    getScale()
    {
        const scale = this.localScale.clone();
        let parent = this.parent;
        while(parent != null)
        {
            scale.x *= parent.localScale.x;
            scale.y *= parent.localScale.y;
            parent = parent.parent;
        }
        return scale;
    }

    /**
     * This adds another entity as a child. The position, rotation, and scale of child entities will be affected by their parent.
     * @instance
     * @memberof Entity
     * @param {Entity} entity 
     */
    addChild(entity)
    {
        if(this.children.indexOf(entity)==-1)
        {
            this.children.push(entity);
            entity.parent = this;
        }
    }

    /**
     * This removes an entity as a child. If removed, the entity will now have a null parent
     * @instance
     * @memberof Entity
     * @param {Entity} entity 
     */
    removeChild(entity)
    {
        const index = this.children.indexOf(entity);
        if(index != -1)
        {
            this.children.splice(index, 1);
            entity.parent = null;
        }
    }

    /**
     * Every frame, each component attached to this entity has their update() function called via this method.
     * @instance
     * @memberof Entity
     * @param {Number} delta 
     */
    update(delta)
    {
        for(let i=0; i<this.components.length; i++)
        {
            const component = this.components[i];
            if(!component.destroyed) component.update(delta);
            if(component.destroyed)
            {
                this.components.splice(i,1);
                i--;
            }
        }
    }
    
    /**
     * Every frame, each component attached to this entity has their render() function called via this method.
     * @instance
     * @memberof Entity
     * @param {CanvasRenderingContext2D} context 
     */
    render(context)
    {
        this.components.forEach(component =>{
            if(!component.destroyed) component.render(context);
        });
    }

    /**
     * This loops through each child and each component attached to the entity, destroying each one.
     * @instance
     * @memberof Entity
     */
    destroy()
    {
        this.destroyed = true;
        this.children.forEach(child =>{
            child.destroy();
        });
        this.children = [];
        this.components.forEach(component =>{
            component.destroy();
        });
        this.components = [];
    }
}