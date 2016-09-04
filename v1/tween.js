function tween() {
    this.currentTime = 0;
    this.delayTime = 0;
    this.durationTime = 1000;
    this.update = null;
    this.complete = null;
    this.progress = function() {
        return Math.min(this.currentTime / (this.delayTime + this.durationTime), 1);
    }
    this.rate = function() {
        return Math.min(Math.max((this.currentTime - this.delayTime) / this.durationTime, 0), 1);
    }
    this.play = function(restart) {
        this.currentTime = restart ? 0 : this.currentTime;
        tween_list.push(this);
    }
}

var tween_list = [];

function Tween_Fun(elapsedSinceLastLoop) {
    var len = tween_list.length;
    for (var i = 0; i < len; i++) {
        tween_list[i].currentTime += elapsedSinceLastLoop;
        var rate = tween_list[i].rate();
        var progress = tween_list[i].progress();
        if (tween_list[i].update != null) {
            tween_list[i].update(rate, progress);
        }
        if (progress >= 1) {
            if (tween_list[i].complete != null) {
                tween_list[i].complete();
            }
            tween_list.splice(i, 1);
            i--;
            len--;
        }
    }
}

function tweens() {
    this.index = 0;
    this.list = [];
    this.prop = [];
    this.update = null;
    this.complete = null;
}

tweens.prototype.addTween = function(prop, timeProp) {
    var tween01 = new tween();
    tween01.currentTime = timeProp.currentTime || 0;
    tween01.delayTime = timeProp.delayTime || 0;
    tween01.durationTime = timeProp.durationTime || 1000;
    this.list.push(tween01);
    this.prop.push(prop);
    this.list[this.index].update = function(rate, progress) {
        var prop = this.prop[this.index];
        var tempObj = {};
        for (var temp in prop) {
            var rate01 = rate * (prop[temp].length - 1);
            var index = Math.floor(rate01);
            index = rate >= 1 ? index - 1 : index;
            var t = rate >= 1 ? 1 : (rate01 - index);
            var value = prop[temp][index] * (1 - t) + prop[temp][index + 1] * t;
            tempObj[temp] = value;
        }
        if (this.update != null) {
            this.update.call(this, rate, progress, tempObj)
        }
    }.bind(this)
    this.list[this.index].complete = function() {
        if (this.index + 1 < this.prop.length) {
            this.index++;
            this.list[this.index].play(true);
        } else {
            if (this.complete != null) {
                this.complete.call(this);
            }
        }
    }.bind(this)

}

tweens.prototype.play = function(restart) {
    this.index = restart ? 0 : this.index;
    this.list[this.index].play(restart);
}

PIXI.tween = {
    Tween: tween,
    Tweens: tweens,
    list: {
        get data() {
            return tween_list
        },
        set data(value) {
            tween_list = value;
        },
        get update() {
            return Tween_Fun
        }
    }
};