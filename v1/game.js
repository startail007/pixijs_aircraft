function extend(child, supertype) {
    child.prototype.__proto__ = supertype.prototype;
    child.prototype.__super = supertype;
}

PIXI.DisplayObject.prototype.hitTest = function(DisplayObject) {
    var OBB01 = this.OBB();
    var OBB02 = DisplayObject.OBB();
    return OBB01.isCollision(OBB02)
}
PIXI.DisplayObject.prototype = Object.assign(PIXI.DisplayObject.prototype, {
    vx: 0,
    vy: 0,
    angle: 0,
    delete: 0,
    move: function() {
        this.x += this.vx;
        this.y += this.vy;
    },
    tween: null
})

function sprite_bullet(texture) {
    PIXI.Sprite.call(this, texture);
}
//sprite_bullet.prototype = new PIXI.Sprite();
extend(sprite_bullet, PIXI.Sprite);

function sprite_aircraft(texture) {
    PIXI.Sprite.call(this, texture);
    /*this.fire = function(bullet_texture) {
        var sprite = new sprite_bullet(bullet_texture);
        sprite.anchor.set(0.5);
        sprite.position.set(this.x, this.y - 25);
        sprite.vy = -10;
        return sprite;
    }*/
    this.fire = function(bullet_texture) {
        var sprite01 = new sprite_bullet(bullet_texture);
        sprite01.anchor.set(0.5);
        sprite01.position.set(this.x - 10, this.y - 15);
        sprite01.vy = -10;
        var sprite02 = new sprite_bullet(bullet_texture);
        sprite02.anchor.set(0.5);
        sprite02.position.set(this.x + 10, this.y - 15);
        sprite02.vy = -10;
        return [sprite01, sprite02];
    }
}
//sprite_aircraft.prototype = new PIXI.Sprite();
extend(sprite_aircraft, PIXI.Sprite);

function sprite_aerolite(texture) {
    PIXI.Sprite.call(this, texture);
    this.score = 0;
    this.blood = 10;
}
//sprite_aerolite.prototype = new PIXI.Sprite();
extend(sprite_aerolite, PIXI.Sprite);

function sprite_fragment(texture) {
    PIXI.Sprite.call(this, texture);
    this.tweenCurrentTime = 0;
    this.tweenDurationTime = 2000;
}
//sprite_fragment.prototype = new PIXI.Sprite();
extend(sprite_fragment, PIXI.Sprite);

function movieclip_explosion(textures) {
    PIXI.extras.MovieClip.call(this, textures);
    this.tweenCurrentTime = 0;
    this.tweenDurationTime = 2000;
}
extend(movieclip_explosion, PIXI.extras.MovieClip)


var lastTime;

function Time(currentTime) {
    if (!lastTime) {
        lastTime = currentTime;
    }
    var elapsedSinceLastLoop = (currentTime - lastTime);
    lastTime = currentTime;
    return elapsedSinceLastLoop
}

function Game_Fun(currentTime) {
    requestAnimationFrame(Game_Fun);
    var elapsedSinceLastLoop = Time(currentTime);
    game_list.forEach(function(obj, index) {
        obj.call(this, elapsedSinceLastLoop);
    });
}

var game_list = [];
PIXI.game = {
    list: {
        get data() {
            return game_list
        },
        set data(value) {
            game_list = value;
        },
        get update() {
            return Game_Fun
        }
    }
};

function control(aircraft0) {
    var left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40),
        Spacebar = keyboard(32);

    left.press = function() {
        aircraft0.vx = -5;
    };

    left.release = function() {
        if (!right.isDown) {
            aircraft0.vx = 0;
        }
    };

    right.press = function() {
        aircraft0.vx = 5;
    };
    right.release = function() {
        if (!left.isDown) {
            aircraft0.vx = 0;
        }
    };

    up.press = function() {
        aircraft0.vy = -5;
    };
    up.release = function() {
        if (!down.isDown) {
            aircraft0.vy = 0;
        }
    };

    down.press = function() {
        aircraft0.vy = 5;
    };
    down.release = function() {
        if (!up.isDown) {
            aircraft0.vy = 0;
        }
    };

    Spacebar.press = function() {};
    Spacebar.release = function() {};
    return {
        left: left,
        right: right,
        up: up,
        down: down,
        Spacebar: Spacebar
    }
}