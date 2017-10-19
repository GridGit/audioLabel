
// 工具类
var Util = function(canvas){
    
}

Util.prototype = {
    // 屏幕坐标到canvas坐标的转换
    windowToCanvas: function(canvas,x, y){
        var bbox = canvas.getBoundingClientRect();
        return {
            x: x - bbox.left * (canvas.width / bbox.width),
            y: y - bbox.top * (canvas.height / bbox.height)
        }
    },
    // 绘制背景网格
    drawGrid: function(canvas,color, stepx, stepy) {
       var context = canvas.getContext('2d');
       context.save()

       context.shadowColor = undefined;
       context.shadowBlur = 0;
       context.shadowOffsetX = 0;
       context.shadowOffsetY = 0;
       
       context.strokeStyle = color;
       context.fillStyle = '#ffffff';
       context.lineWidth = 0.5;
       context.fillRect(0, 0, context.canvas.width, context.canvas.height);

       context.beginPath();

       for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
         context.moveTo(i, 0);
         context.lineTo(i, context.canvas.height);
       }
       context.stroke();

       context.beginPath();

       for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
         context.moveTo(0, i);
         context.lineTo(context.canvas.width, i);
       }
       context.stroke();

       context.restore();
    },
    // 保存绘图状态
    saveDrawingSurface: function(canvas) {
       var context = canvas.getContext('2d');
       return context.getImageData(0, 0, canvas.width, canvas.height);
    },
    // 回复绘图状态
    restoreDrawingSurface: function(canvas,imageData) {
       var context = canvas.getContext('2d');
       context.putImageData(imageData, 0, 0);
    },
    // 绘制辅助线
    drawGuidewires: function(canvas, x, y){
       var context = canvas.getContext('2d')
       context.save();
       context.strokeStyle = 'rgba(233,222,196,0.6)';
       context.lineWidth = 0.5;
       this._drawVerticalLine(x);
       this._drawHorizontalLine(y);
       context.restore();
    },
    // 辅助线 水平直线
    _drawHorizontalLine: function (y) {
       context.beginPath();
       context.moveTo(0,y+0.5);
       context.lineTo(context.canvas.width,y+0.5);
       context.stroke();
    },
    // 辅助线 垂直直线
    _drawVerticalLine: function (x) {
       context.beginPath();
       context.moveTo(x+0.5,0);
       context.lineTo(x+0.5,context.canvas.height);
       context.stroke();
    }
}


// 点
var Point = function (x, y) {
   this.x = x;
   this.y = y;
};

// 多边形
// centerX，centerY，radius 外接圆圆心，半径
// sides, startAngle 多边形变数，起始角度
// strokeStyle，fillStyle 描边样式，填充样式
// filled 是否填充
var Polygon = function (centerX, centerY, radius, sides, startAngle, strokeStyle, fillStyle, filled) {
   this.x = centerX;
   this.y = centerY;
   this.radius = radius;
   this.sides = sides;
   this.startAngle = startAngle;
   this.strokeStyle = strokeStyle;
   this.fillStyle = fillStyle;
   this.filled = filled;
};

Polygon.prototype = {
   // 获取多边形的点
   getPoints: function () {
      var points = [],
          angle = this.startAngle || 0;

      for (var i=0; i < this.sides; ++i) {
         points.push(new Point(this.x + this.radius * Math.sin(angle),
                           this.y - this.radius * Math.cos(angle)));
         angle += 2*Math.PI/this.sides;
      }
      return points;
   },
   // 创建多边形路劲
   createPath: function (context) {
      var points = this.getPoints();

      context.beginPath();

      context.moveTo(points[0].x, points[0].y);

      for (var i=1; i < this.sides; ++i) {
         context.lineTo(points[i].x, points[i].y);
      }

      context.closePath();
   },
   // 多边形描边
   stroke: function (context) {
      context.save();
      this.createPath(context);
      context.strokeStyle = this.strokeStyle;
      context.stroke();
      context.restore();
   },
   // 多边形填充
   fill: function (context) {
      context.save();
      this.createPath(context);
      context.fillStyle = this.fillStyle;
      context.fill();
      context.restore();
   },
   // 移动中心点
   move: function (x, y) {
      this.x = x;
      this.y = y;
   },
};

var DrawRect = function(x1, y1, x2, y2, canvas){
    this.x1 = x1,
    this.x2 = x2, 
    this.y1 = y1,
    this.y2 = y2,
    this.canvas = canvas,
    this.context = canvas.getContext('2d'),
    this.selected = false,
    this.filled = false;
    this.strokeStyle = "red" ,
    this.fillStyle = 'rgba(207,42,48,0.2)',
    this.selectedFillStyle = 'rgba(207,42,48,0.6)',
    this.isInLeft = false,
    this.isInRight = false,
    this.points = this._getPoints();   
}

DrawRect.prototype = {
    paint: function() { 
        this.context.beginPath();
        this.context.moveTo(this.points[0].x, this.points[0].y);
        for(var i = 1; i < this.points.length; i++){        
            this.context.lineTo(this.points[i].x, this.points[i].y);
        }
        this.context.lineTo(this.points[0].x, this.points[0].y);

        this.context.closePath();

        this.context.strokeStyle = this.strokeStyle;

        if(this.filled){
            this.context.fillStyle = this.fillStyle;
            this.context.fill();
        }
        if(this.selected){
            this.context.fillStyle = this.fillStyle;

        }
        this.context.stroke();
        
    },
    _getPoints: function(){
        var points = [];
        points.push(new Point(this.x1, this.y1));
        points.push(new Point(this.x2, this.y1));
        points.push(new Point(this.x2, this.y2));
        points.push(new Point(this.x1, this.y2));
        return points
    },
    createPath: function(){
        this.context.beginPath();
        this.context.moveTo(this.points[0].x, this.points[0].y);
        for(var i = 1; i < this.points.length; i++){        
            this.context.lineTo(this.points[i].x, this.points[i].y);
        }
        this.context.lineTo(this.points[0].x, this.points[0].y);

        this.context.closePath();
    },
    stroke: function(){
        this.context.save();
        this.createPath();
        this.context.strokeStyle = this.strokeStyle;
        this.context.stroke();
        this.context.restore();
    },
    fill: function(){
        this.context.save();
        this.createPath();
        this.context.fillStyle = this.fillStyle;
        if(this.selected){
            this.context.fillStyle = this.selectedFillStyle;
        }
        this.context.fill();
        this.context.restore();
    },
    changePoints: function(deltaX, deltaY){
        if(deltaX){
            this.x1 = this.x1 + deltaX;
            this.x2 = this.x2 + deltaX;
        }
        if(deltaY){
            this.y1 = this.y1 + deltaY;
            this.y2 = this.y2 + deltaY;
        }
        this.points = this._getPoints();
    },
    changeX1: function(deltaX){
        if (deltaX) {
            this.x1 = this.x1 + deltaX;
        }
        this.points = this._getPoints();
    },
    changeX2: function(deltaX){
        if(deltaX){
            this.x2 = this.x2 + deltaX;
        }
        this.points = this._getPoints();
    },
    isPointIn: function(loc){
        if(loc.x >= this.x1 && loc.x <= this.x2 && loc.y >= this.y1 && loc.y <=this.y2){
            return true
        }
        return false
    },
    isPointInLeft: function(loc){
        if(this.isPointIn){
            if(loc.x >= this.x1 && loc.x <= this.x1 + 5){
                return true;
            }
        }
        return false;
    },
    isPointInRight: function(loc){
        if(this.isPointIn){
            if(loc.x <= this.x2 && loc.x >= this.x2 - 5){
                return true;
            }
        }
        return false;
    },



}

// 矩形
// left top right bottom 矩形左上和右下点距离
// canvas 绘图环境
// color 颜色
var DragRect = function(left, top, right, bottom, canvas, color = '#FF0000') {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.color = color;
    this.canvas = canvas;
    this.name = '';
    this.type = 0;
    this.text = '';
    this.selected = false;
    this.context = canvas.getContext("2d");
}

DragRect.prototype = {
    paint: function() {
        this.context.beginPath();
        this.context.moveTo(this.left, this.top);
        this.context.lineTo(this.right, this.top);
        this.context.lineTo(this.right, this.bottom);
        this.context.lineTo(this.left, this.bottom);
        this.context.lineTo(this.left, this.top);
        this.context.strokeStyle = this.color;
        if (this.selected) {
            this.context.fillStyle = this.color;
            this.context.fill();
        }
        this.context.stroke();
    },
    resize: function(mouse, delta) {
        var ratio = 1 + delta / 15.0;
        ratio = ratio > 0 ? ratio : 1;
        cl = mouse.x - this.left;
        ct = mouse.y - this.top;
        cr = mouse.x - this.right;
        cb = mouse.y - this.bottom;
        this.left = mouse.x - cl * ratio;
        this.top = mouse.y - ct * ratio;
        this.right = mouse.x - cr * ratio;
        this.bottom = mouse.y - cb * ratio;
    },
    fitCanvas: function(ratio, dx, dy) {
        this.left = this.left / ratio + dx;
        this.top = this.top / ratio + dy;
        this.right = this.right / ratio + dx;
        this.bottom = this.bottom / ratio + dy;
    },
    isMouseInRect: function(mouse){
        return mouse.x > this.left && mouse.x < this.right
                && mouse.y > this.top && mouse.y < this.bottom;
    }
}