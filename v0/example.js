var OBB = function() {
    this.init = function(bornCenterX, bornCenterY, halfWidth, halfHeight) {
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
        this.centerPoint = [
            bornCenterX,
            bornCenterY
        ];
        this.axisX = [];
        this.axisY = [];
        this.setRotation(0.0);
    }
    this.dot = function(axisA, axisB) {
        return Math.abs(axisA[0] * axisB[0] + axisA[1] * axisB[1]);
    }
    this.setRotation = function(rotation) {
        this.rotation = rotation;

        this.axisX[0] = Math.cos(rotation);
        this.axisX[1] = Math.sin(rotation);

        this.axisY[0] = -Math.sin(rotation);
        this.axisY[1] = Math.cos(rotation);
    }
    this.getProjectionRadius = function(axis) {
        var projectionAxisX = this.dot(axis, this.axisX);
        var projectionAxisY = this.dot(axis, this.axisY);
        return this.halfWidth * projectionAxisX + this.halfHeight * projectionAxisY;
    }
    this.isCollision = function(obb) {
        var centerDistanceVertor = [
            this.centerPoint[0] - obb.centerPoint[0],
            this.centerPoint[1] - obb.centerPoint[1]
        ];
        var axes = [
            this.axisX,
            this.axisY,
            obb.axisX,
            obb.axisY,
        ];
        for (var i = 0; i < axes.length; i++) {
            if (this.getProjectionRadius(axes[i]) + obb.getProjectionRadius(axes[i]) <= this.dot(centerDistanceVertor, axes[i])) {
                return false;
            }
        }
        return true;
    }
};

function hitTest(s1, s2) {
    if (s1.x + s1.width > s2.x)
        if (s1.x < s2.x + s2.width)
            if (s1.y + s1.height > s2.y)
                if (s1.y < s2.y + s2.height) return true;
    return false;
};

function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    key.downHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    key.upHandler = function(event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}

var left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40),
    Spacebar = keyboard(32);

var draw = new PIXI.Graphics();
draw.beginFill(0xffff00);
//draw.drawCircle(0, 0, 3);
draw.drawRoundedRect(0, 0, 3, 6, 3)
draw.endFill();
var texture = draw.generateCanvasTexture();

var bullet = d3.range(0, 20, 1)
    .map(function(d, i) {
        var sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        var obj = {
            vx: 0,
            vy: 0,
            active: false,
            sprite: sprite
        };
        return obj;
    });



var renderer = PIXI.autoDetectRenderer(800, 600, {
    antialias: true,
    backgroundColor: 0x7f7f7f
});
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();



var bg_layer = new PIXI.Container();
stage.addChild(bg_layer);

var bullet_layer = new PIXI.Container();
stage.addChild(bullet_layer);

var aircraft_layer = new PIXI.Container();
stage.addChild(aircraft_layer);

var enemy_layer = new PIXI.Container();
stage.addChild(enemy_layer);

var fragment_layer = new PIXI.Container();
stage.addChild(fragment_layer);

var score = 0;
var Text01 = new PIXI.Text('score : 0', {
    font: 'bold 22px Arial',
    fill: '#cc00ff',
    align: 'center',
    stroke: '#FFFFFF',
    strokeThickness: 2
});
Text01.position.set(10, 10);
stage.addChild(Text01);


var bg_texture = PIXI.Texture.fromImage('Bg01.jpg');

var bg = d3.range(0, 2, 1)
    .map(function(d, i) {
        var sprite = new PIXI.Sprite(bg_texture);
        sprite.position.set(0, i * 600);
        bg_layer.addChild(sprite)
        var obj = {
            vx: 0,
            vy: 5,
            sprite: sprite
        };
        return obj;
    });


var enemy_texture = PIXI.Texture.fromImage('aerolite01.png');

var enemy = d3.range(0, 50, 1)
    .map(function(d, i) {
        var sprite = new PIXI.Sprite(enemy_texture);
        sprite.anchor.set(0.5);
        var obj = {
            vx: 0,
            vy: 0,
            angle: 0,
            active: false,
            sprite: sprite,
            score: 0
        };
        return obj;
    });

var fragment = []
var fragment_textures = []

for (var i = 0; i < 7; i++) {
    var texture = PIXI.Texture.fromImage('fragment01_' + i + '.png');
    fragment_textures.push(texture);
}


var aircraft_texture = PIXI.Texture.fromImage('aircraft01.png');

var aircraft_sprite = new PIXI.Sprite(aircraft_texture);
aircraft_sprite.position.set(400, 500);
aircraft_sprite.anchor.set(0.5);
aircraft_layer.addChild(aircraft_sprite);
var aircraft = {
    vx: 0,
    vy: 0,
    sprite:aircraft_sprite
}


left.press = function() {
    aircraft.vx = -5;
};

left.release = function() {
    if (!right.isDown) {
        aircraft.vx = 0;
    }
};

right.press = function() {
    aircraft.vx = 5;
};
right.release = function() {
    if (!left.isDown) {
        aircraft.vx = 0;
    }
};


up.press = function() {
    aircraft.vy = -5;
};
up.release = function() {
    if (!down.isDown) {
        aircraft.vy = 0;
    }
};


down.press = function() {
    aircraft.vy = 5;
};
down.release = function() {
    if (!up.isDown) {
        aircraft.vy = 0;
    }
};

Spacebar.press = function() {

};
Spacebar.release = function() {

};


function aircraft_play() {
    aircraft.sprite.x = Math.min(Math.max(aircraft.sprite.x+ aircraft.vx, 0), 800)
    aircraft.sprite.y = Math.min(Math.max(aircraft.sprite.y+ aircraft.vy, 0), 600)
}
var bullet_spacing = 0;

function set_score() {
    Text01.text = 'score : ' + score;
}

function bullet_fire() {
    if (Spacebar.isDown && bullet_spacing == 0) {
        bullet_spacing = 5;
        bullet.every(function(d, i) {
            if (!d.active) {
                bullet_layer.addChild(d.sprite);
                d.sprite.x = aircraft.sprite.x;
                d.sprite.y = aircraft.sprite.y - 25;
                d.vy = -10;
                d.active = true;
                return false;
            }
            return true;
        });
    }
    if (bullet_spacing > 0) {
        bullet_spacing--;
    }
}

function bullet_play() {
    bullet.forEach(function(d, i) {
        if (d.active) {
            d.sprite.x += d.vx;
            d.sprite.y += d.vy;

            var OBB01 = new OBB();
            OBB01.init(d.sprite.x, d.sprite.y, d.sprite.width * 0.5, d.sprite.height * 0.5)
            OBB01.setRotation(d.sprite.rotation);
            enemy.every(function(d0, i0) {
                if (d0.active) {
                    var OBB02 = new OBB();
                    OBB02.init(d0.sprite.x, d0.sprite.y, d0.sprite.width * 0.5, d0.sprite.height * 0.5)
                    OBB02.setRotation(d0.sprite.rotation)
                    var bool = OBB01.isCollision(OBB02);
                    if (bool) {
                        score += d0.score;
                        d.active = false;
                        bullet_layer.removeChild(d.sprite);
                        d0.active = false;
                        enemy_layer.removeChild(d0.sprite);
                        create_fragment(d0);
                        return false;
                    }
                }
                return true;
            });
            if (d.active && d.sprite.y < 0) {
                d.active = false;
                bullet_layer.removeChild(d.sprite);
            }

        }
    });
}

var enemy_spacing = 0;

function enemy_fire() {
    if (enemy_spacing == 0) {
        enemy_spacing = 15;
        enemy.every(function(d, i) {
            if (!d.active) {
                enemy_layer.addChild(d.sprite);
                d.score = Math.floor(Math.random() * 500) + 100
                d.sprite.x = Math.random() * 800;
                d.sprite.y = -100 - Math.random() * 50;
                d.vx = 2 - Math.random() * 4;
                d.vy = 4 + Math.random() * 3;
                d.angle = 0.1 - Math.random() * 0.2;
                d.active = true;
                return false;
            }
            return true;
        });
    }
    if (enemy_spacing > 0) {
        enemy_spacing--;
    }
}

function enemy_play(currentTime) {
    var OBB01 = new OBB();
    OBB01.init(aircraft.sprite.x, aircraft.sprite.y, aircraft.sprite.width * 0.5, aircraft.sprite.height * 0.5)
    OBB01.setRotation(aircraft.sprite.rotation)
    enemy.forEach(function(d, i) {
        if (d.active) {
            d.sprite.x += d.vx;
            d.sprite.y += d.vy;
            d.sprite.rotation += d.angle;

            var OBB02 = new OBB();
            OBB02.init(d.sprite.x, d.sprite.y, d.sprite.width * 0.5, d.sprite.height * 0.5)
            OBB02.setRotation(d.sprite.rotation);

            var bool = OBB01.isCollision(OBB02);
            if (bool) {
                score -= d.score;
                d.active = false;
                enemy_layer.removeChild(d.sprite);
                create_fragment(d);
            } else if (d.sprite.y > 800) {
                d.active = false;
                enemy_layer.removeChild(d.sprite);
            }
        }
    });
}

function create_fragment(d) {
    for (var i = 0; i < 7; i++) {
        var len = fragment.length;
        var obj = {
            vx: 10 - Math.random() * 20,
            vy: 10 - Math.random() * 20,
            angle: 0.1 - Math.random() * 0.2,
            tweenCurrentTime: 0,
            tweenDurationTime: 2000,
            delete: false
        }
        var sprite;
        sprite = new PIXI.extras.MovieClip(fragment_textures);
        sprite.position.set(d.sprite.x, d.sprite.y);
        sprite.anchor.set(0.5);
        sprite.gotoAndStop(i);
        fragment_layer.addChild(sprite);
        obj.sprite = sprite;
        fragment[len] = obj;
    }
}

function fragment_play(currentTime) {
    fragment.forEach(function(d, i) {
        if (!d.delete) {
            d.tweenCurrentTime += elapsedSinceLastLoop;
            var rate = Math.min(d.tweenCurrentTime / d.tweenDurationTime, 1);
            d.sprite.x += d.vx;
            d.sprite.y += d.vy;
            d.sprite.rotation += d.angle;
            d.sprite.alpha = 1 - rate
            if (rate >= 1) {
                d.delete = true;
                fragment_layer.removeChild(d.sprite);
            }
        }
    });
    for (var i = 0; i < fragment.length; i++) {
        if (fragment[i].delete) {
            fragment.splice(i, 1);
            i--;
        }
    }
}

function bg_play() {
    bg.forEach(function(d, i) {
        d.sprite.y += d.vy;
        if (d.sprite.y >= 600) {
            d.sprite.y -= 600*2
        }
    });
}
state = aircraft_play;
var startingTime;
var lastTime;
var totalElapsedTime;
var elapsedSinceLastLoop;

function Time(currentTime) {
    if (!startingTime) {
        startingTime = currentTime;
    }
    if (!lastTime) {
        lastTime = currentTime;
    }
    totalElapsedTime = (currentTime - startingTime);
    elapsedSinceLastLoop = (currentTime - lastTime);
    lastTime = currentTime;
}

function render(currentTime) {
    Time(currentTime);
    //console.log('aaaa', elapsedSinceLastLoop)
    requestAnimationFrame(render);
    bullet_fire();
    bullet_play();
    enemy_fire();
    enemy_play(currentTime);
    fragment_play(currentTime)
    bg_play()
    set_score();
    state();
    renderer.render(stage);
}

requestAnimationFrame(render);