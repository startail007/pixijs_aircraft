var bg_texture = PIXI.Texture.fromImage('Bg01.jpg');

var draw = new PIXI.Graphics();
draw.beginFill(0xffffff);
draw.drawRoundedRect(0, 0, 3, 6, 3)
draw.endFill();
var bullet_texture = draw.generateCanvasTexture();

var aerolite_texture = PIXI.Texture.fromImage('aerolite01.png');

var fragment_textures = []

for (var i = 0; i < 7; i++) {
    var texture = PIXI.Texture.fromImage('fragment01_' + i + '.png');
    fragment_textures.push(texture);
}

var aircraft_texture = PIXI.Texture.fromImage('aircraft01.png');

var explosion_texture = loadFramedSpriteSheet('explosion01.png', 64, 64)

var aerolite = [];
var bullet = [];


var DeleteArray = [bullet, aerolite];

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

var aerolite_layer = new PIXI.Container();
stage.addChild(aerolite_layer);

var fragment_layer = new PIXI.Container();
stage.addChild(fragment_layer);

var explosion_layer = new PIXI.Container();
stage.addChild(explosion_layer);






var aircraft = new sprite_aircraft(aircraft_texture);
aircraft.position.set(400, 500);
aircraft.anchor.set(0.5);
aircraft_layer.addChild(aircraft);



function loadFramedSpriteSheet(src, frameWidth, frameHeight) {
    frames = [];
    var img = new Image();
    img.src = src;
    var base = new PIXI.BaseTexture(img);
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            frames.push(new PIXI.Texture(base, new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight)));
        }
    }
    return frames;
}

var score = 0;
var Text01 = new PIXI.Text('score : 0', {
    fontFamily: 'Arial',
    fontSize: '22px',
    fontWeight: 'bold',
    fill: '#cc00ff',
    align: 'center',
    stroke: '#FFFFFF',
    strokeThickness: 2
});
Text01.position.set(10, 10);
stage.addChild(Text01);

var sprite = new PIXI.extras.TilingSprite(bg_texture, renderer.width, renderer.height);
var bg = {
    vx: 0,
    vy: 5,
    sprite: sprite
};
bg_layer.addChild(sprite)
var control01 = control(aircraft);

function aircraft_play() {
    aircraft.x = Math.min(Math.max(aircraft.x + aircraft.vx, 0), 800)
    aircraft.y = Math.min(Math.max(aircraft.y + aircraft.vy, 0), 600)
}
var bullet_spacing = 0;

function set_score() {
    Text01.text = 'score : ' + score;
}

function bullet_fire() {
    if (control01.Spacebar.isDown && bullet_spacing == 0) {
        bullet_spacing = 5;
        var sprites = aircraft.fire(bullet_texture);
        sprites.forEach(function(element) {
            bullet_layer.addChild(element);
            bullet.push(element)
        });
    }
    if (bullet_spacing > 0) {
        bullet_spacing--;
    }
}
var colorMatrix = new PIXI.filters.ColorMatrixFilter();
colorMatrix.brightness(255, 0.5);
var blurFilter = new PIXI.filters.BlurFilter();
blurFilter.blurX = 0.2;
blurFilter.blurY = 0.2;

function bullet_play() {
    bullet.forEach(function(d, i) {
        if (!d.delete) {
            d.move();
            aerolite.every(function(d0, i0) {
                if (!d0.delete) {
                    var bool = d.hitTest(d0);
                    if (bool) {
                        d.delete = true;
                        d0.blood--;
                        if (d0.blood <= 0) {
                            score += d0.score;
                            d0.delete = true;
                            create_fragment(d0.x, d0.y);
                            create_explosion(d0.x, d0.y, d0.score);
                        }
                        d0.filters = [colorMatrix];
                        create_tween(d0)
                        return false;
                    }
                }
                return true;
            });
            if (!d.delete && d.y < 0) {
                d.delete = true;
            }
        }
    });

    function create_tween(sprite) {
        var tween01 = new PIXI.tween.Tween();
        tween01.durationTime = 50;
        tween01.update = function(rate, progress) {

        }
        tween01.complete = function() {
            sprite.filters = [];
            //sprite.parent.removeChild(sprite);
        }
        //sprite.tween = tween01;

        tween01.play();
    }

}

function create_aerolite() {
    var sprite = new sprite_aerolite(aerolite_texture);
    sprite.anchor.set(0.5);
    sprite.position.set(Math.random() * 800, -100 - Math.random() * 50);
    sprite.vx = 2 - Math.random() * 4;
    sprite.vy = 4 + Math.random() * 3;
    sprite.angle = 0.1 - Math.random() * 0.2;
    sprite.score = Math.floor(Math.random() * 500) + 100
    sprite.blood = Math.floor(Math.random() * 10) + 5
    /*var blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blurX = 0.2;
    blurFilter.blurY = 0.2;
    sprite.filters = [blurFilter];*/


    return sprite
}

var aerolite_spacing = 0;

function aerolite_fire() {
    if (aerolite_spacing == 0) {
        aerolite_spacing = 15;
        var sprite = create_aerolite();
        aerolite_layer.addChild(sprite);
        aerolite.push(sprite);
    }
    if (aerolite_spacing > 0) {
        aerolite_spacing--;
    }
}

function aerolite_play() {
    aerolite.forEach(function(d, i) {
        if (!d.delete) {
            d.move();
            d.rotation += d.angle;
            var bool = aircraft.hitTest(d)
            if (bool) {
                score -= d.score;
                d.delete = true;
                create_fragment(d.x, d.y);
                create_explosion(d.x, d.y, -d.score);
            } else if (d.y > 800) {
                d.delete = true;
            }
        }
    });
}



function create_fragment(x, y) {
    for (var i = 0; i < 7; i++) {
        var sprite = new sprite_fragment(fragment_textures[i]);
        sprite.vx = 6 - Math.random() * 12;
        sprite.vy = 6 - Math.random() * 12;
        sprite.angle = 0.1 - Math.random() * 0.2;
        sprite.position.set(x, y);
        sprite.anchor.set(0.5);
        fragment_layer.addChild(sprite);
        create_tween(sprite);
    }

    function create_tween(sprite) {
        var tweens01 = new PIXI.tween.Tweens();
        tweens01.addTween({
            alpha: [1, 0],
            vx: [sprite.vx, sprite.vx * 0.8],
            vy: [sprite.vy, sprite.vx * 0.8],
            angle: [sprite.angle, sprite.angle * 0.8]
        }, {
            delayTime: 300,
            durationTime: 1000
        });
        tweens01.play();
        tweens01.update = function(rate, progress, tempObj) {
            sprite.alpha = tempObj.alpha;
            sprite.x += tempObj.vx;
            sprite.y += tempObj.vy;
            sprite.rotation += tempObj.angle;
        }
        tweens01.complete = function() {
            sprite.parent.removeChild(sprite);
        }
    }
}

function create_explosion(x, y, score) {

    var movieclip = new movieclip_explosion(explosion_texture);
    /*movieclip.animationSpeed = 0.5;
    movieclip.gotoAndPlay(0);
    movieclip.loop = false;*/
    movieclip.position.set(x, y);
    movieclip.anchor.set(0.5);
    explosion_layer.addChild(movieclip);

    var score_str;
    var fill;
    if (score > 0) {
        score_str = '+' + score;
        fill = '#0aff00';
    } else {
        score_str = '-' + score;
        fill = '#ff0000';
    }
    var Text01 = new PIXI.Text(score_str, {
        fontFamily: 'Arial',
        fontSize: '22px',
        fontWeight: 'bold',
        fill: fill,
        align: 'center',
        stroke: '#FFFFFF',
        strokeThickness: 2
    });
    Text01.position.set(x, y);
    Text01.anchor.set(0.5);
    stage.addChild(Text01);

    create_tween(movieclip, Text01);


    function create_tween(movieclip, Text01) {
        var tweens01 = new PIXI.tween.Tweens();
        tweens01.addTween({
            alpha: [1, 0],
            scaleX: [1, 2.5],
            scaleY: [1, 2.5],
            frame: [0, movieclip.totalFrames - 1]
        }, {
            delayTime: 100,
            durationTime: 500
        });
        tweens01.play();
        tweens01.update = function(rate, progress, tempObj) {
            movieclip.alpha = tempObj.alpha;
            movieclip.scale.x = tempObj.scaleX;
            movieclip.scale.y = tempObj.scaleY;
            movieclip.gotoAndStop(Math.round(tempObj.frame));
        }
        tweens01.complete = function() {
            movieclip.parent.removeChild(movieclip);
        }

        var tweens02 = new PIXI.tween.Tweens();
        tweens02.addTween({
            alpha: [1, 0],
            scaleX: [1, 1.5],
            scaleY: [1, 1.5],
            y: [Text01.y, Text01.y - 10]
        }, {
            delayTime: 100,
            durationTime: 500
        });
        tweens02.play();
        tweens02.update = function(rate, progress, tempObj) {
            Text01.alpha = tempObj.alpha;
            Text01.scale.x = tempObj.scaleX;
            Text01.scale.y = tempObj.scaleY;
            Text01.y = tempObj.y;
        }
        tweens02.complete = function() {
            Text01.parent.removeChild(Text01);
        }
    }
}

function bg_play() {
    bg.sprite.tilePosition.y += bg.vy;
    bg.sprite.tilePosition.y = bg.sprite.tilePosition.y % 600;
}


function Delete() {
    var temp, len;
    for (var k = 0; k < DeleteArray.length; k++) {
        temp = DeleteArray[k]
        len = temp.length;
        for (var i = 0; i < len; i++) {
            if (temp[i].delete) {
                var parent = temp[i].parent;
                parent.removeChild(temp[i]);
                temp[i] = null;
                delete temp[i];
                temp.splice(i, 1);
                i--;
                len--;
            }
        }
    }
}



state = aircraft_play;

function render(currentTime) {
    renderer.render(stage);
}
PIXI.game.list.data = [bullet_fire, bullet_play, aerolite_fire, aerolite_play, bg_play, set_score, state, Delete, PIXI.tween.list.update, render]
requestAnimationFrame(PIXI.game.list.update);
//requestAnimationFrame(render);