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
/*var aa = {
    get aaa(){
        return 100
    }
}
console.log(PIXI.DisplayObject.prototype)*/
/*PIXI.DisplayObject.prototype = Object.assign(PIXI.DisplayObject.prototype, {
    get aaa(){
        return 100
    },
    get position(){
        return this.position
    }
    
})*/
//PIXI.DisplayObject.prototype.aaa = 100;
PIXI.DisplayObject.prototype.OBB = function() {
    var OBB01 = new OBB();
    OBB01.init(this.x, this.y, this.width * 0.5, this.height * 0.5)
    OBB01.setRotation(this.rotation);
    return OBB01
}
PIXI.DisplayObject.prototype.hitTest = function(DisplayObject) {
    var OBB01 = this.OBB();
    var OBB02 = DisplayObject.OBB();    
    return OBB01.isCollision(OBB02)
}