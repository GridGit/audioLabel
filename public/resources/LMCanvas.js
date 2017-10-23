
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
       this._drawVerticalLine(x, context);
       this._drawHorizontalLine(y, context);
       context.restore();
    },
    // 辅助线 水平直线
    _drawHorizontalLine: function (y, context) {
       context.beginPath();
       context.moveTo(0,y+0.5);
       context.lineTo(context.canvas.width,y+0.5);
       context.stroke();
    },
    // 辅助线 垂直直线
    _drawVerticalLine: function (x, context) {
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

// 游标
var DrawVernier = function(x, y1, y2, canvas, style, lineWidth){
  this.x = x,
  this.y1 = y1,
  this.y2 = y2,
  this.strokeStyle = style || 'blue',
  this.lineWidth = lineWidth || 2,
  this.canvas = canvas,
  this.context = canvas.getContext('2d');
}

DrawVernier.prototype = {
  paint: function(){
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(this.x, this.y1);
    this.context.lineTo(this.x, this.y2);
    this.context.strokeStyle = this.strokeStyle;
    this.context.lineWidth = this.lineWidth;
    this.context.stroke();
    this.context.restore();
  }
}
// 网格
var DrawBcakgrounGrid = function(canvas,gridWidth,gridHeight){
  this.width = canvas.width,
  this.height = canvas.height,
  this.gridWidth = gridWidth,
  this.gridHeight = gridHeight,
  this.canvas = canvas,
  this.lineWidth = 1,
  this.strokeStyle = 'rgba(116, 182, 127, 0.4)',
  this.context = canvas.getContext('2d')
}

DrawBcakgrounGrid.prototype = {
  paint: function(){
    var xNum = parseInt(Math.floor(this.width / this.gridWidth));
    var yNum = parseInt(Math.floor(this.height / this.gridHeight));
    for(var i = 1; i <= xNum; i++){
      this._drawXAxis(i);
    }
    for(var j = 0; j <= yNum; j++){
      this._drawYAxis(j);
    }
  },
  _drawXAxis: function(i){
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(this.gridWidth * i + 0.5, 0);
    this.context.lineTo(this.gridWidth * i + 0.5, this.height);
    this.context.strokeStyle = this.strokeStyle;
    this.context.lineWidth = this.lineWidth;
    this.context.stroke();
    this.context.closePath();
    this.context.restore();
  },
  _drawYAxis: function(i){
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(0, this.gridHeight * i + 0.5);
    this.context.lineTo(this.width, this.gridHeight * i + 0.5);
    this.context.strokeStyle = this.strokeStyle;
    this.context.lineWidth = this.lineWidth;
    this.context.stroke();
    this.context.closePath();
    this.context.restore();
  }
}
// 坐标轴
var DrawCoord = function(canvas, x, y, timeRate){
      this.canvas = canvas,
      this.context = canvas.getContext('2d'),
      this.timeRate = timeRate,
      this.x = x, //坐标原点 x
      this.y = y, //坐标原点 y
      this.width = this.canvas.width - this.x, //宽度
      this.height = this.canvas.height - this.y //高度
} 
DrawCoord.prototype = {
  paint: function(){
    this._drawXAxis(this.x, this.y);
    this._drawYAxis(this.x, this.y);
    this._drawingYUnit(10);
    this._drawingXUnit();
  },
  _drawXAxis: function(x,y){
    this._drawingLine(x,y,this.canvas.width,y);
  },
  _drawYAxis: function(x,y){
      this._drawingLine(x,y,x,0);
      this._drawingLine(x,y,x,this.canvas.height);
  },
  _drawingLine: function(x1,y1,x2,y2){
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(x1,y1);
    this.context.lineTo(x2,y2);
    this.context.strokeStyle = 'orange';
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.closePath();
    this.context.restore();
  },
  _drawingYUnit: function(unit){
    var num = parseInt(this.height / unit);
    for(var i = 1; i <= num; i++){
      var y1 = this.height - unit * i;
      var y2 = this.height + unit * i;
      this._drawingLine(this.x - 5, y1, this.x + 5, y1);
      // this._drawingText( parseInt(unit * i)  , this.x - 20, y1 + parseInt(unit / 2));
      this._drawingLine(this.x - 5, y2, this.x + 5, y2);
      // this._drawingText( -parseInt(unit * i) , this.x - 20, y2 );
    }
  },
  _drawingXUnit: function(){
    var num = parseInt(this.width / this.timeRate);
    for(var i = 1; i <= num; i++){
      var x = this.x + this.timeRate * i;
      if(this.timeRate < 100){ //10px = 1s 时
        if(i % 5 === 0){
          this._drawingLine(x, this.y, x , this.y - 15);
          this._drawingText( parseInt(i) + 's', x - 5, this.y + 10);
        }else{
          this._drawingLine(x, this.y, x , this.y - 10);
        } 
      }else{
        if(i % 5 === 0){ //100px = 1s 
          this._drawingLine(x, this.y, x , this.y - 15);
          
        }else{
          this._drawingLine(x, this.y, x , this.y - 10);
        }
        this._drawingText( parseInt(i) + 's', x - 2, this.y + 10); 
      }     
    }
  },
  _drawingText: function(text, x, y){
    this.context.save();
    this.context.beginPath();
    this.context.font = '10px Arial';
    this.context.fillStyle = '#ffffff';
    this.context.fillText( text, x, y);
    this.context.restore();
  }
}
// 线 音频
var DrawLine = function(canvas, data, coordOffsetX, coordOffsetY, rate){
    this.canvas = canvas,
    this.context = canvas.getContext('2d'),
    this.data = data,
    this.coordOffsetX = coordOffsetX,
    this.coordOffsetY = coordOffsetY,
    this.rate = rate || 1,
    this.lineWidth = rate || 1
}
DrawLine.prototype = {
    paint: function(){  
      for(var i = 0; i < this.data.length; i++){
        this._drawingLine(i * this.rate + this.coordOffsetX , this.coordOffsetY - this.data[i][1],i * this.rate + this.coordOffsetX ,this.coordOffsetY - this.data[i][0] )    
      }   
    },
    _drawingLine: function(x1,y1,x2,y2){
      this.context.save();
      this.context.beginPath();
      this.context.moveTo(x1,y1);
      this.context.lineTo(x2,y2);
      this.context.strokeStyle = 'green';
      this.context.lineWidth = this.lineWidth;
      this.context.stroke();
      this.context.closePath();
      this.context.restore();
    }
}

// 矩形
var DrawRect = function(x1, y1, x2, y2, canvas, originX, rateX, initRate){
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
    this.points = this._getPoints(),
    this.originX = originX || 20.5,
    this.rateX = rateX || 100,
    this.startTime = this._getStartTime(),
    this.endTime = this._getEndTime()
    this.stringifyStartTime = this._stringifyTime(this.startTime),
    this.stringifyEndTime = this._stringifyTime(this.endTime),
    this.text = [],
    this.type = '',

    this.initRate = initRate,
    this.scaleX1 = this._getScaleX1(initRate),
    this.scaleX2 = this._getScaleX2(initRate),
    this.scalePoints = this._getScalePoints();
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
    scalePaint: function(){
      this.context.beginPath();
      this.context.moveTo(this.scalePoints[0].x, this.scalePoints[0].y);
      for(var i = 1; i < this.scalePoints.length; i++){        
          this.context.lineTo(this.scalePoints[i].x, this.scalePoints[i].y);
      }
      this.context.lineTo(this.scalePoints[0].x, this.scalePoints[0].y);

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
    _getScalePoints: function(){
        var points = [];
        points.push(new Point(this.scaleX1, this.y1));
        points.push(new Point(this.scaleX2, this.y1));
        points.push(new Point(this.scaleX2, this.y2));
        points.push(new Point(this.scaleX1, this.y2));
        return points
    },
    _getScaleX1: function(initRate){
      return (this.x1 - this.originX) * initRate + this.originX;
    },
    _getScaleX2: function(initRate){
      return (this.x2 - this.originX) * initRate + this.originX;
    },
    _getStartTime: function(){
      return (this.x1 - this.originX) / this.rateX;
    },
    _getEndTime: function(){
      return (this.x2 - this.originX) / this.rateX;
    },
    _getUpTime: function(){
      this.startTime = this._getStartTime();
      this.endTime = this._getEndTime();
    },
    _stringifyTime: function(time){
      var floatTime = time.toFixed(2);
      var intTime = parseInt(floatTime);
      var timeString = [];
      // 小数
      var decTime = parseInt(floatTime.toString().slice(-2));
      if(decTime < 10){
        decTime = '0' + decTime;
      }
      timeString.unshift(decTime);
      // 秒
      var second = intTime % 60;
      if(second < 10){
        second = '0' + second;
      }
      timeString.unshift(second);
      // 分
      var minute = parseInt(intTime / 60) % 60;
      if(minute < 10){
        minute = '0' + minute
      }
      timeString.unshift(minute)
      // 时
      var hour = parseInt(intTime / 3600);
      if(hour < 10){
        hour = '0' + hour
      }
      timeString.unshift(hour)
      return timeString.join(':')
    },
    _changeState: function(){
        this.points = this._getPoints();
        this._getUpTime();
        this.stringifyStartTime = this._stringifyTime(this.startTime);
        this.stringifyEndTime = this._stringifyTime(this.endTime);
    },
    changeScaleState: function(initRate){
      this.scaleX1 = this._getScaleX1(initRate);
      this.scaleX2 = this._getScaleX2(initRate);
      this.scalePoints = this._getScalePoints();
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
    createScalePath: function(){
      this.context.beginPath();
      this.context.moveTo(this.scalePoints[0].x, this.scalePoints[0].y);
      for(var i = 1; i < this.scalePoints.length; i++){        
          this.context.lineTo(this.scalePoints[i].x, this.scalePoints[i].y);
      }
      this.context.lineTo(this.scalePoints[0].x, this.scalePoints[0].y);

      this.context.closePath();
    },
    scaleStroke: function(){
        this.context.save();
        this.createScalePath();
        this.context.strokeStyle = this.strokeStyle;
        this.context.stroke();
        this.context.restore();
    },
    scaleFill: function(){
        this.context.save();
        this.createScalePath();
        this.context.fillStyle = this.fillStyle;
        if(this.selected){
            this.context.fillStyle = this.selectedFillStyle;
        }
        this.context.fill();
        this.context.restore();
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
        this._changeState();

    },
    changeScalePoints: function(initRate){
      this.scaleX1 = this._getScaleX1(initRate);
      this.scaleX2 = this._getScaleX2(initRate);
     
      this.scalePoints = this._getScalePoints();
    },
    changeX1: function(deltaX){
        if (deltaX) {
            this.x1 = this.x1 + deltaX;
        }

        this._changeState();
    },
    changeScaleX1: function(deltaX, initRate){
      if(deltaX && initRate){
        this.scaleX1 = this._getScaleX1(initRate);
      }
      this.scalePoints = this._getScalePoints();
    },
    changeX2: function(deltaX){
        if(deltaX){
            this.x2 = this.x2 + deltaX;
        }
       this._changeState();
    },
    changeScaleX2: function(deltaX, initRate){
      if(deltaX && initRate){
        this.scaleX2 = this._getScaleX2(initRate);
      }
      this.scalePoints = this._getScalePoints(initRate);
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
// wav文件
var WavFile = function(filePath) {
  this.path = filePath;
  this.rawBinString;
  this.shortArray;
  this.loaded = false;
  this.loadCallback = null;
  this.frequency;
  this.dataLength;
  this.time;
  this.load();
}
WavFile.prototype = {
  load: function() {
      var reader = new FileReader();
      var that = this;
      reader.onload = function(e) {
          let head = 78;
          that.rawBinString = e.target.result;
          that.frequency = that.char2long(that.rawBinString, 24);
          that.dataLength = that.char2long(that.rawBinString, 74) / 2;
          that.shortArray = that.byteString2shortArray(that.rawBinString.slice(head));
          that.time = that.dataLength / that.frequency;
          if (that.loadCallback != null) {
              that.loadCallback();
          }
          that.loaded = true;
      }
      reader.readAsBinaryString(this.path);
  },
  onload: function(callback) {
      this.loadCallback = callback;
      if (this.loaded) {
          callback();
      }
  },
  getFrequency: function() {
      return this.frequency;
  },
  getTime: function() {
      return this.time;
  },
  getData: function() {
      return this.shortArray;
  },
  char2short: function(c1, c2) {
      let s = c2 * 256 + c1;
      return s > 32767 ? s - 65536 : s;
  },
  char2long: function(byteString, startChar) {
      return byteString.charCodeAt(startChar+3) * 16777216 + byteString.charCodeAt(startChar+2) * 65536
              + byteString.charCodeAt(startChar+1) * 256 + byteString.charCodeAt(startChar);
  },
  byteString2shortArray: function(bs) {
      let len = bs.length / 2;
      sa = new Array(len);
      for (var i = 0; i < len; i++) {
          sa[i] = this.char2short(bs.charCodeAt(i*2), bs.charCodeAt(i*2+1));
      }
      return sa;
  }
} 









