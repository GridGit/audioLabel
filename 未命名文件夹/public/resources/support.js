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
var DrawBackgroundGrid = function(canvas, gridWidth, gridHeight, lineWidth, strokeStyle){
	this.canvas = canvas,
	console.log(canvas)
	this.context = canvas.getContext('2d'),
	this.width = canvas.width,
	this.height = canvas.height,
	this.lineWidth = lineWidth || 1,
	this.strokeStyle = strokeStyle || 'rgba(116, 182, 127, 0.4)';
	this.gridWidth = gridWidth || 40,
	this.gridHeight = gridWidth || 20
}
DrawBackgroundGrid.prototype = {
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