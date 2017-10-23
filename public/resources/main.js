window.onload = function(){
  
      // select() ==>  document.getElementById()
      // audio控件
  var audio = select('audio'),
  	  // 文件控件
      file_input = select('file_list'),	
  	  // var setTime = select('setTime');	
  	  edit_checkbox = select('editCheckbox'),
  	  // canvas
  	  audio_bg = select('audio_bg'),
  	  // canvas context
      bg_context = audio_bg.getContext('2d'),
	    // a b and ab button
      judge_type_a = select('judge_type_a'),
      judge_type_b = select('judge_type_b'),
      judge_wrap_type_ab = select('judge_wrap_type_ab'),

      // a b and ab panel
      judge_text_a = select('judge_text_a'),
      judge_text_b = select('judge_text_b'),
      judge_text_ab = select('judge_text_ab'),

      text_a = select('text_a'),
      text_b = select('text_b'),
      text_ab_a = select('text_ab_a'),
      text_ab_b = select('text_ab_b'),

      judge_start_time = select('judge_start_time'),
      judge_end_time = select('judge_end_time'),

      judge_play = select('judge_play'),
      // submit
      submit_save = $('#submit_save'),
      submit_delete = $('#submit_delete'),
      submit_download = $('#submit_download');

      // 选择的按钮 A B AB
  var selectedType = 'A',
        // 文件索引
  	  fileIdx = 0,
  	  // 是否编辑
  	  editing = false,
  	  // 多边形列表
  	  polygons = [],
  	  // 绘图表面数据
  	  surfaceData,   
      // 鼠标位置坐标
      mousedown = {},
      // 鼠标移动最后坐标
      mousemoveEndPosition = {},
      // 是否在拖动 
      rectDrag = false,
      // 移动 拉伸起始点
      draggingStartX,
	    // 指示线
      guidewires = true,
      // 时间比率 100px/s or 10px/s
      timeRate,
      // 音频宽度
      audioWaveWidth,
      // 坐标原点 x   
      coordOffsetX = 20.5, //10.5
      // 坐标原点 y
      coordOffsetY = parseInt(audio_bg.height / 2), // 200 / 2  100
      // 选中的ploygon
      editingPloygon,
      // play
      playFlag = 0,
      // 
      mousemoveFlag = true,
      initBgCanvasWidth,
      changedData,
  	  startBgCanvasWidth = audio_bg.width,
  	  initRate = 1,
      data ;

  var util = new Util();

  // controls
  var controls = {
    updatePloygonsData: function(polygon){
      for(var i = 0; i < polygons.length; i++){
        if(polygons[i].stringifyStartTime === polygon.stringifyStartTime){
          polygons[i].type = polygon.type;
          for(var j = 0; j < polygon.text.length; j++){
            polygons[i].text[j] = polygon.text[j];
          }
        }
      }
      view.renderBarAfterSave();
      view.render();
      // setTimeout(function(){
      //   alert('保存成功')
      // },200)
    },
    deletePloygonsData: function(polygon){
      for(var i = 0; i < polygons.length; i++){
        if(polygons[i].stringifyStartTime === polygon.stringifyStartTime){
          polygons.splice(i, 1);
        }
      }
      view.renderBgAudio();
      view.renderBarAfterDel();
      view.render();
      setTimeout(function(){
        alert('删除成功。。。');
      },200)    
    },
    changeOpeartionBarData: function(index){
      editingPloygon = polygons[index];
      judge_start_time.innerText = editingPloygon.stringifyStartTime;
      judge_end_time.innerText = editingPloygon.stringifyEndTime;
    },
    getJSONData: function(name){
      var jsonData = {};
      jsonData.name = name;
      jsonData.data = [];
      for(var i = 0; i < polygons.length; i++){
        var obj = {};
        obj.startTime = polygons[i].startTime;
        obj.endTime = polygons[i].endTime;
        obj.stringifyEndTime = polygons[i].stringifyEndTime;
        obj.stringifyStartTime = polygons[i].stringifyStartTime;
        obj.type = polygons[i].type;
        obj.text = [];
        for(var j = 0; j < polygons[i].text.length; j++){
          obj.text[j] = polygons[i].text[j];
        }
        jsonData.data.push(obj)
      }
      return JSON.stringify(jsonData)
    },
    saveData: function(name){
      var text = this.getJSONData(name);
      var data = new Blob([text], {type: "text/plain"});
      var textFile = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      var fileName = file_input.files[fileIdx].name + '.txt';
      link.setAttribute('download', fileName);
      link.href = textFile;

      document.body.appendChild(link);
      // wait for the link to be added to the document
      window.requestAnimationFrame(function () {
          var event = new MouseEvent('click');
          link.dispatchEvent(event);
          document.body.removeChild(link);
      });
    
      // ajax
      // $.ajax({
      //   type: 'POST',
      //   url: '/up',
      //   data: 'text',
      //   success: function(e){
      //     console.log('ajax:')
      //     console.log(e)
      //   },
      //   error: function(){
      //     console.log('提交失败');
      //   }
      // })
    },
    changeData: function(data, time, frequency, width, height){
	  	var selectWidth = Math.floor(frequency / width);
	  	var selectedData = [];
	    // 筛选数组数据
	  	for(var i = 0; i < data.length; i++){	
	  		if((i % selectWidth) == 0){
	  			selectedData.push(data[i])
	  		}
	  	}	
	    // 改变数组数据值
	  	for(var j = 0; j < selectedData.length; j++){
	  		if(Math.abs(selectedData[j]) * 0.1 > height){
	  			if(Math.abs(selectedData[j]) / selectedData[j] > 0){
						selectedData[j] = (Math.abs(selectedData[j]) / selectedData[j]) * height - 30 + 30 * Math.random();
	  			}else{
	    			  	selectedData[j] = (Math.abs(selectedData[j]) / selectedData[j]) * height + 30 - 30 * Math.random();
	    			}
	  		}else{
	  			selectedData[j] = parseInt(selectedData[j] * 0.1);
	  		}	
	  	}
	    // 返回过滤后的数组
	  	return selectedData;
	  },
    updateList: function(){
      view.render();
    },
    init: function(){
      view.init();
    }
  }
  // view
  var view = {
    init: function(){
      // 保存正在编辑的数据
      submit_save.click(function(e){
        e.stopPropagation();
        e.preventDefault();
        if(editingPloygon){
          if(selectedType === 'A' && text_a.value.length){
            editingPloygon.type = 'A';
            editingPloygon.text[0] = text_a.value;
            controls.updatePloygonsData(editingPloygon); 

            return;
          }else if(selectedType === 'A' && !text_a.value.length){
            alert('请录入A说的话。。。');
            
            return;
          }
          if(selectedType === 'B' && text_b.value.length){
            editingPloygon.type = 'B';
            editingPloygon.text[0] = text_b.value;
            controls.updatePloygonsData(editingPloygon);
            
            return;
          }else if(selectedType === 'B' && !text_b.value.length){
            alert('请录入B说的话。。。');
            
            return;
          }
          if(selectedType === "AB" && text_ab_a.value.length && text_ab_b.value.length){
            editingPloygon.type = "AB";
            editingPloygon.text[0] = text_ab_a.value;
            editingPloygon.text[1] = text_ab_b.value;
            controls.updatePloygonsData(editingPloygon);
            
            return;
          }else if(selectedType === "AB" && !text_ab_a.value.length || !text_ab_b.value.length){
            alert('请录入A和B的话。。。')
            
            return;
          }
        }else{
          alert('请先选择一段音频。。。')         
          return;
        }   
      })
      // 删除正在编辑的数据
      submit_delete.click(function(e){
        e.stopPropagation();
        e.preventDefault();

        if(editingPloygon){
          controls.deletePloygonsData(editingPloygon);
          return;
        }else{
          alert('请先选择一段音频。。。');

          return;
        }
      });

      submit_download.click(function(e){
        if(polygons.length && file_input.files[fileIdx].name){
          controls.saveData(file_input.files[fileIdx].name);
          return;
        }else if(!polygons.length){
          alert('请先提取一段音频。。。');
          return;
        }else if(!file_input.files[fileIdx].name){
          alert('请选择音频文件。。。');
          return;
        }        
      })
      $('.result_list').on('dblclick', 'li',function(e){
        var index = $(this).prevAll().length;
        controls.changeOpeartionBarData(index);
        
        $('.result_list li:nth-child(2n+1)').css('background-color','rgb(160, 160, 160)');
        $('.result_list li:nth-child(2n)').css('background-color', 'rgb(210, 210, 210)');
        $(this).css('background-color', 'rgba(212, 46, 46, 0.8)');
        return;
      });

      this.$resultList = $('.result_list');
      this.resultTemplate = $('script[data-template="voice_single_result"]').html();
      this.resultDoubleTemplate = $('script[data-template="voice_double_result"]').html();

      this.render()
    },
    render: function(){
      this.renderReaultList();
    },
    renderReaultList: function(){
      var $resultList = this.$resultList;
      var resultTemplate = this.resultTemplate;
      var resultDoubleTemplate = this.resultDoubleTemplate;
      $resultList.html("");
      polygons.forEach(function(item){
        if(item.type === 'A' || item.type === 'B' ){
          var thisTemplate = resultTemplate.replace(/{{startTime}}/g, item.stringifyStartTime).replace(/{{endTime}}/g, item.stringifyEndTime).replace(/{{type}}/g, item.type.toUpperCase()).replace(/{{context}}/g, item.text[0]);
        }
        if(item.type === 'AB'){
          var thisTemplate = resultDoubleTemplate.replace(/{{startTime}}/g, item.stringifyStartTime).replace(/{{endTime}}/g, item.stringifyEndTime).replace(/{{typeA}}/g, item.type.substring(0,1).toUpperCase()).replace(/{{typeB}}/g, item.type.substring(1,2).toUpperCase()).replace(/{{contextA}}/g, item.text[0]).replace(/{{contextB}}/g, item.text[1]);
        }
        if(!item.type){
          var thisTemplate = resultTemplate.replace(/{{startTime}}/g, item.stringifyStartTime).replace(/{{endTime}}/g, item.stringifyEndTime).replace(/{{type}}/g, '').replace(/{{context}}/g, '');
        }        
        $resultList.append(thisTemplate);
      });
    },
    renderBgAudio: function(){
      bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);
       // 背景网格
      var gridWidth = 70;
      var griHeight = 20;
      var drawBcakgrounGrid = new DrawBcakgrounGrid(audio_bg, gridWidth * initRate , griHeight);
      drawBcakgrounGrid.paint();        
      // 音频信号
      var drawLine = new DrawLine(audio_bg, changedData, coordOffsetX, coordOffsetY, initRate);
      drawLine.paint(); 
      // 坐标轴
      var drawCoord = new DrawCoord(audio_bg, coordOffsetX, coordOffsetY, timeRate * initRate);
      drawCoord.paint();

      for(var i = 0; i < polygons.length; i++){
        polygons[i].changeScaleState(initRate);
        polygons[i].createScalePath();
        polygons[i].scaleStroke();
        polygons[i].scaleFill();
      }
    },
    renderBarAfterDel: function(){
      editingPloygon = null;
      judge_start_time.innerText = '00:00:00:00';
      judge_end_time.innerText = '00:00:00';
      $('#judge_input_area').find('input').val('');
      selectedType = 'A';
    },
    renderBarAfterSave: function(){
      $('#judge_input_area').find('input').val('');
    }
  }

  controls.init();

	// 矩形绘制
	function drawRect(rect){
		rect.createScalePath();
		rect.scaleStroke();
		rect.scaleFill();
	}
	// 绘制全部矩形
	function drawRects(){
		polygons.forEach(function(polygon){
			drawRect(polygon);
		});
	}
	function getPointPosition(polygons, mousedown){
		if(mousedown.x < polygons[0].x1){
			return -1;
		}
		if(mousedown.x > polygons[polygons.length - 1].x2){
			return -2;
		}
		for(var i = 0; i < polygons.length; i++){
			if(mousedown.x > polygons[i].x2 && mousedown.x < polygons[i + 1].x1){
				return i
			}
		}		
	}
	function getPolygonIndex(polygons, polygon){
		for(var i = 0; i < polygons.length; i++){
			if (polygons[i].x1 === polygon.x1) {
				return i
			}
		}
	}
  // btn a
	judge_type_a.addEventListener('click', function(e){
	  e.stopPropagation();
	  e.preventDefault();

	  // switch class
	  addClass(this, 'judge_wrap_type_selected');
	  removeClass(judge_type_b, 'judge_wrap_type_selected');
	  removeClass(judge_type_ab, 'judge_wrap_type_selected');

	  $('#judge_input_area input').val('');

	  selectedType = 'A';

	  // switch panel
	  judge_text_a.style.display = 'block';
	  judge_text_b.style.display = 'none';
	  judge_text_ab.style.display = 'none';
	})
  // btn b
	judge_type_b.addEventListener('click', function(e){
	  e.stopPropagation();
	  e.preventDefault();
	  // switch class
	  addClass(this, 'judge_wrap_type_selected');
	  removeClass(judge_type_a, 'judge_wrap_type_selected');
	  removeClass(judge_type_ab, 'judge_wrap_type_selected');

      $('#judge_input_area input').val('');

      selectedType = 'B';

	  // switch panel
	  judge_text_a.style.display = 'none';	  
	  judge_text_b.style.display = 'block';
	  judge_text_ab.style.display = 'none';
	})
  // btn ab
	judge_type_ab.addEventListener('click', function(e){
	  e.stopPropagation();
	  e.preventDefault();
	  // switch class
	  addClass(this, 'judge_wrap_type_selected');
	  removeClass(judge_type_a, 'judge_wrap_type_selected');
	  removeClass(judge_type_b, 'judge_wrap_type_selected');

	    $('#judge_input_area input').val('');

	    selectedType = 'AB';

	    judge_text_a.style.display = 'none';	  
	  judge_text_b.style.display = 'none';
	  judge_text_ab.style.display = 'block';
	})
  // btn play
	judge_play.addEventListener('click', function(e){
	    e.stopPropagation();
	    e.preventDefault();

	    // 判断一段话是否结束
	    var palayInterval;
	    clearInterval(palayInterval)
	    if(editingPloygon){

	      var start = editingPloygon.startTime;
	      var end = editingPloygon.endTime;
	      var duration = end - start;
	      
	      if(!playFlag){
	         audio.currentTime = editingPloygon.startTime
	      }

	      if(audio.paused){      
	        audio.play();
	        this.innerText = '暂停';
	        playFlag = 1;
	      }else{        
	        audio.pause();
	        this.innerText = '播放';
	      }
	      var palayInterval = setInterval(function(){
	        if(audio.currentTime >= end){
	          audio.pause();
	          judge_play.innerText = '播放';
	          playFlag = 0;
	          clearInterval(palayInterval);
	        }
	      }, 50)
	  	}
	}) 
	
 
  // 检测class
	function hasClass(ele, cls){
	  return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}
	function addClass(ele, cls){
	  if(!hasClass(ele, cls)){
	  	ele.className += ' ' + cls;
	  }
	}
	function removeClass(ele, cls){
	  if(hasClass(ele, cls)){
	  	var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
	  	ele.className = ele.className.replace(reg, '');
	  }
	}
	function select(id){
	  return document.getElementById(id)
	}
  // 文件控件
  file_input.addEventListener('change',function(e){
	    e.preventDefault;
	    e.stopPropagation;
	    fileIdx = 0;
	    loadData();  
  })  
  function loadData(order=1) {
      if (file_input.files.length === 0) return;
      var fileName = file_input.files[fileIdx].name;
      var len = fileName.length;

      while (fileName.slice(len - 3, len) != 'wav') {
          if (order == 1) {
              ++fileIdx;
          } else {
              --fileIdx;
          }
          fileName = file_input.files[fileIdx].name;
          len = fileName.length;
          
      }
      var wf = new WavFile(file_input.files[fileIdx]);
      wf.onload(function() {        
          // 重置状态  
          if(polygons.length){
            polygons = [];
            view.renderBarAfterDel();
            view.renderReaultList();
          }    
          data = wf.getData();            
          var time = wf.getTime();
          var frequency = wf.getFrequency();
          // 设置audio的src和总时长
          audio.src = file_input.files[fileIdx].name;
          audio.allTime = time;
          
          // if(time <= 60 && time > 0){
          //   timeRate = 100;
          // }else if(time > 60){
          //   timeRate = 10;
          // }

          timeRate = 200 / parseInt(time / 60 + 1);
          console.log('时长比 ：')
          console.log(time);
          console.log(time / 60 + 1);
          console.log(timeRate); 

          // 刷选音频数据
          // changedData = changeData(data, time, frequency, timeRate, audio_bg.height / 2);
          changedData = selectData(data, time, frequency, timeRate, audio_bg.height /2);
          // 音频宽度
          audioWaveWidth = time * timeRate ;         
          // 背景层canvas宽度
          audio_bg.width = Math.round(time + 1) * timeRate > 800 ? Math.round(time + 1) * timeRate : 800;
          // 背景网格
          var gridWidth = 70;
          var griHeight = 20;
          var drawBcakgrounGrid = new DrawBcakgrounGrid(audio_bg, gridWidth, griHeight);
          drawBcakgrounGrid.paint();        
          // 音频信号
          var drawLine = new DrawLine(audio_bg, changedData, coordOffsetX, coordOffsetY);
          drawLine.paint(); 
          // 坐标轴
          var drawCoord = new DrawCoord(audio_bg, coordOffsetX, coordOffsetY, timeRate);
          drawCoord.paint();
              
          initBgCanvasWidth = audio_bg.width;
      });
  }
  audio_bg.addEventListener('mousewheel', bgMouseWheel, false)
  function bgMouseWheel(e){
	  	e.stopPropagation();
	  	e.preventDefault();

      if (!data) return;

	  	var loc = util.windowToCanvas(audio_bg, e.clientX, e.clientY);

	  	// 滚动一次缩放比例
	    var rate = e.wheelDelta / 120 / 10;
	    // 累计缩放比例
	    initRate = rate + initRate
	    if(initRate > 2){
	    	initRate = initRate - rate;
	    	return;
	    }else if(initRate < 0.2){
	    	initRate = initRate - rate;
	    	return;
	    }
	    var scaleWidth =  initBgCanvasWidth * initRate;

	    if(scaleWidth < startBgCanvasWidth ){
	    	audio_bg.width = startBgCanvasWidth;
	    }else{
	    	audio_bg.width = scaleWidth;
	    }

	    bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);
       // 背景网格
      var gridWidth = 70;
      var griHeight = 20;
      var drawBcakgrounGrid = new DrawBcakgrounGrid(audio_bg, gridWidth * initRate , griHeight);
      drawBcakgrounGrid.paint();        
      // 音频信号
      var drawLine = new DrawLine(audio_bg, changedData, coordOffsetX, coordOffsetY, initRate);
      drawLine.paint(); 
      // 坐标轴
      var drawCoord = new DrawCoord(audio_bg, coordOffsetX, coordOffsetY, timeRate * initRate);
      drawCoord.paint();

      for(var i = 0; i < polygons.length; i++){
        polygons[i].changeScaleState(initRate);
        polygons[i].createScalePath();
        polygons[i].scaleStroke();
        polygons[i].scaleFill();
      }
  }
  audio_bg.addEventListener('DOMMouseScroll', bgDOMMouseScroll, false)
  function bgDOMMouseScroll(e){
    e.stopPropagation();
    e.preventDefault();

    if(!data) return;

    var loc = util.windowToCanvas(audio_bg, e.clientX, e.clientY);

    // 滚动一次缩放比例
    var rate = - e.detail / 10;
    // 累计缩放比例
    initRate = rate + initRate
    if(initRate > 2){
      initRate = initRate - rate;
      return;
    }else if(initRate < 0.5){
      initRate = initRate - rate;
      return;
    }

    var scaleWidth =  initBgCanvasWidth * initRate;

    if(scaleWidth < startBgCanvasWidth ){
      audio_bg.width = startBgCanvasWidth;
    }else{
      audio_bg.width = scaleWidth;
    }

    bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);
     // 背景网格
    var gridWidth = 70;
    var griHeight = 20;
    var drawBcakgrounGrid = new DrawBcakgrounGrid(audio_bg, gridWidth * initRate , griHeight);
    drawBcakgrounGrid.paint();        
    // 音频信号
    var drawLine = new DrawLine(audio_bg, changedData, coordOffsetX, coordOffsetY, initRate);
    drawLine.paint(); 
    // 坐标轴
    var drawCoord = new DrawCoord(audio_bg, coordOffsetX, coordOffsetY, timeRate * initRate);
    drawCoord.paint();

    for(var i = 0; i < polygons.length; i++){
      polygons[i].changeScaleState(initRate);
      polygons[i].createScalePath();
      polygons[i].scaleStroke();
      polygons[i].scaleFill();
    }
  }
  audio_bg.addEventListener('mousedown', bgMousedown, false)
  function bgMousedown(e){
  	e.stopPropagation();
  	e.preventDefault();
  	if(audio.src === ''){
  		alert('请选择音频文件。。。');
  		return;
  	}
  	var loc = util.windowToCanvas(audio_bg, e.clientX, e.clientY);
  	loc.x = (loc.x - coordOffsetX) /initRate + coordOffsetX;
  	
    console.log(polygons);
    console.log(loc);

  	if(polygons.length){
  		if(pointIsInPolygons(polygons, loc)){
  			editing = true;
  			polygons.forEach(function(polygon){
  				polygon.createPath();
  				if(bg_context.isPointInPath(loc.x, loc.y)){
  					audio_bg.style.cursor = 'pointer';
  					if(polygon.isPointInLeft(loc)){
  						audio_bg.style.cursor = 'w-resize';
  						polygon.isInLeft = true
  					}else if(polygon.isPointInRight(loc)){
  						audio_bg.style.cursor = 'e-resize';
  						polygon.isInRight = true;
  					}
  					polygon.selected = true;
  					polygon.scaleFill();
  					rectDrag = polygon;
  					draggingStartX = loc.x;
  					return 
  				}
  			})
  		}else{
        if(loc.x < coordOffsetX) return;
  			bgStartDragging(loc);
  			rectDrag = true;
  		}
  	}else{
  		if(loc.x < coordOffsetX) return;
  		bgStartDragging(loc);
  		rectDrag = true;
  	}
  }
  // 判断点是否在矩形中
	function pointIsInPolygons(polygons, loc){
		for(var i = 0; i < polygons.length; i++){			
			if(polygons[i].isPointIn(loc)){
				return true
			}
		}
		return false
	}
  function bgStartDragging(loc){
  	surfaceData = util.saveDrawingSurface(audio_bg);
  	mousedown.x = loc.x;
  	mousedown.y = 0;
  }
  audio_bg.addEventListener('mousemove', bgMousemove, false); 
  function bgMousemove(e){
	  	e.stopPropagation();
	  	e.preventDefault();
	  	var loc = util.windowToCanvas(audio_bg, e.clientX, e.clientY);
	  	loc.x = (loc.x - coordOffsetX) /initRate + coordOffsetX;
      audio_bg.style.cursor = 'default';

     
	  	if(polygons.length){
	  		if(pointIsInPolygons(polygons, loc)){
	  			polygons.forEach(function(polygon){
	  				polygon.createPath();
	  				if(bg_context.isPointInPath(loc.x, loc.y)){
	  					audio_bg.style.cursor = 'pointer';
	  					if(polygon.isPointInLeft(loc)){
	  						audio_bg.style.cursor = 'w-resize';
	  					}
	  					if(polygon.isPointInRight(loc)){
	  						audio_bg.style.cursor = 'e-resize';
	  					}
	  				}
	  			})
	  		}
	  	}
	  	if(editing && rectDrag){
	  		var deltaX = loc.x - draggingStartX;
	  		draggingStartX = loc.x;

	  		var index = getPolygonIndex(polygons, rectDrag);
	  		if(rectDrag.isInLeft){ //左移
	  			if(rectDrag.x2 - rectDrag.x1 - deltaX > 10){
	  				if(polygons[index - 1]){
	  					if(rectDrag.x1 + deltaX > polygons[index - 1].x2){
	  						rectDrag.changeX1(deltaX);
	  						rectDrag.changeScaleX1(deltaX, initRate);
	  					}
	  				}else { 
	  					if(rectDrag.x1 + deltaX >= coordOffsetX){
	  						rectDrag.changeX1(deltaX);
	  						rectDrag.changeScaleX1(deltaX, initRate);
	  					}
	  				}
	  			}
	  		}else if(rectDrag.isInRight){ //右移
	  			if(rectDrag.x2 + deltaX - rectDrag.x1 > 10){
	  				if(polygons[index + 1]){
	  					if(rectDrag.x2 + deltaX < polygons[index + 1].x1){
	  						rectDrag.changeX2(deltaX);
	  						rectDrag.changeScaleX2(deltaX, initRate);
	  					}
	  				}else{
	  					if(rectDrag.x2 + deltaX <= initBgCanvasWidth){
	  						rectDrag.changeX2(deltaX);
	  						rectDrag.changeScaleX2(deltaX, initRate);
	  					}
	  				}
	  			}
	  		}else{ //整体
	  			if(deltaX <= 0){
	  				if(polygons[index - 1]){ //左有
	  					if(rectDrag.x1 + deltaX > polygons[index -1].x2){
	  						rectDrag.changePoints(deltaX);
	  						rectDrag.changeScalePoints(initRate);
	  					}
	  				}else{ //左无
	  					if(rectDrag.x1 + deltaX >= coordOffsetX){
	  						rectDrag.changePoints(deltaX);
	  						rectDrag.changeScalePoints(initRate);
	  					}
	  				}
	  			}else{
	  				if(polygons[index + 1]){//右有
	  					if(rectDrag.x2 +deltaX < polygons[index + 1].x1){
	  						rectDrag.changePoints(deltaX);
	  						rectDrag.changeScalePoints(initRate);
	  					}
	  				}else{
	  					if(rectDrag.x2 + deltaX <= initBgCanvasWidth){
	  						rectDrag.changePoints(deltaX);
	  						rectDrag.changeScalePoints(initRate);
	  					}
	  				}
	  			}
	  		}
	  		bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);
		  	var gridWidth = 70;
			  var griHeight = 20;
			  var drawBcakgrounGrid = new DrawBcakgrounGrid(audio_bg, gridWidth * initRate , griHeight);
			  drawBcakgrounGrid.paint();        
			  // 音频信号
			  var drawLine = new DrawLine(audio_bg, changedData, coordOffsetX, coordOffsetY, initRate);
			  drawLine.paint(); 
			  // 坐标轴
			  var drawCoord = new DrawCoord(audio_bg, coordOffsetX, coordOffsetY, timeRate * initRate);
			  drawCoord.paint();

			  drawRects();
			  if(guidewires){
				  util.drawGuidewires(audio_bg, (loc.x - coordOffsetX) * initRate + coordOffsetX, loc.y);
			  }
	  	}else{
	  		if(rectDrag){
           // mousedown状态 移出到最右边
          if(loc.x < coordOffsetX){
              util.restoreDrawingSurface(audio_bg, surfaceData);
              mousedown.x = null;
              rectDrag = false;
             return;
          }
	  		  if(polygons.length != 0){
					var position = getPointPosition(polygons, mousedown);

          console.log(position)

					if(position === -1){  // 最左边
						if(loc.x >= coordOffsetX && loc.x <= polygons[0].x1){
							util.restoreDrawingSurface( audio_bg ,surfaceData);
							bgDrawRubberband(loc);
							
              mousemoveFlag = true;
							mousemoveEndPosition.x = loc.x;
							mousemoveEndPosition.y = 0;
							if(guidewires){
								util.drawGuidewires(audio_bg, (loc.x - coordOffsetX) * initRate + coordOffsetX, loc.y);
							}	
						}
					}else if(position === - 2){  //最右边
            console.log(audio_bg.width);

            console.log(loc)
						if(loc.x >= polygons[polygons.length - 1].x2 && loc.x <= initBgCanvasWidth){
              console.log(loc)
             

							util.restoreDrawingSurface( audio_bg ,surfaceData);
							bgDrawRubberband(loc);
							
              mousemoveFlag = true;
							mousemoveEndPosition.x = loc.x;
							mousemoveEndPosition.y = 0;
							if(guidewires){
								util.drawGuidewires(audio_bg, (loc.x - coordOffsetX) * initRate + coordOffsetX, loc.y);
							}	
						}
					}else {  //两个矩形之间
						if(loc.x >= polygons[position].x2 && loc.x <= polygons[position + 1].x1){
							util.restoreDrawingSurface( audio_bg ,surfaceData);
							bgDrawRubberband(loc);

              mousemoveFlag = true;
							mousemoveEndPosition.x = loc.x;
							mousemoveEndPosition.y = 0;
							if(guidewires){
								util.drawGuidewires(audio_bg, (loc.x - coordOffsetX) * initRate + coordOffsetX, loc.y);
							}	
						}
					}
				}else{
					    util.restoreDrawingSurface(audio_bg, surfaceData);
				  	  bgDrawRubberband(loc);
				  	  if(guidewires){
				  		  util.drawGuidewires(audio_bg, (loc.x - coordOffsetX) * initRate + coordOffsetX, loc.y);
				  	  }
				  }				  	  
		  	}
	  	}  	
  }
  audio_bg.addEventListener('mouseout', bgMouseout, false);
  function bgMouseout(e){
  	e.stopPropagation();
  	e.preventDefault();
  }
  function bgDrawRubberband(loc){
  		
  		if(mousedown.x > loc.x){
  			var x = loc.x;
  			loc.x = mousedown.x;
  			mousedown.x = x;
  		}	  	
	  	var rect = new DrawRect(mousedown.x, mousedown.y, loc.x, audio_bg.height, audio_bg, coordOffsetX, timeRate, initRate);
	  	drawRect(rect); 
	  	if(!rectDrag){
	  	   judge_start_time.innerText = rect.stringifyStartTime;
	       judge_end_time.innerText = rect.stringifyEndTime;

	       editingPloygon = rect;

		   	 if(polygons.length == 0){
		   	 	polygons.push(rect);
		   	 	return;
		   	 }else if(polygons.length == 1){
		   	 	if(rect.x2 <= polygons[0].x1){
		   	 		polygons.unshift(rect);
		   	 		return;
		   	 	}else if(rect.x1 >= polygons[0].x2){
		   	 		polygons.push(rect);
		   	 		return;
		   	 	}
		   	 }else{
		   	 	for(var i = 0; i < polygons.length; i++){
		   	       if(rect.x2 <= polygons[i].x1 ){
		   	       	    if(i === 0){
		   	       	    	polygons.unshift(rect)
		   	       	    	return; 
		   	       	    }else if(rect.x1 >= polygons[i - 1].x2){
		   	       	    	polygons.splice( i , 0, rect)
		   	       	    	return;
		   	       	    }	   	       		
		   	       }else {
		   	          if(rect.x1 >= polygons[polygons.length - 1].x2){
		   	          	polygons.push(rect)
		   	          	return;
		   	          }
		   	       }
		   	   }
		   	}	   	   
	   }
	}
  audio_bg.addEventListener('mouseup', bgMouseup, false);
  function bgMouseup(e){
  	e.stopPropagation();
  	e.preventDefault();
  	// audio_bg.style.cursor = 'default';
  	var loc = util.windowToCanvas(audio_bg, e.clientX, e.clientY);
  	loc.x = (loc.x - coordOffsetX) /initRate + coordOffsetX;
  	if(loc.x < coordOffsetX) return;
  	rectDrag = false;

    console.log(polygons);
    console.log(loc);
  	
    if(editing){
  		polygons.forEach(function(polygon){
  				polygon.createPath();
  				if(bg_context.isPointInPath(loc.x, loc.y)){
  					bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);					
  					polygon.selected = false;
  					polygon.isInLeft = false;
  					polygon.isInRight = false;					 					
            bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);
             // 背景网格
            var gridWidth = 70;
            var griHeight = 20;
            var drawBcakgrounGrid = new DrawBcakgrounGrid(audio_bg, gridWidth * initRate , griHeight);
            drawBcakgrounGrid.paint();        
            // 音频信号
            var drawLine = new DrawLine(audio_bg, changedData, coordOffsetX, coordOffsetY, initRate);
            drawLine.paint(); 
            // 坐标轴
            var drawCoord = new DrawCoord(audio_bg, coordOffsetX, coordOffsetY, timeRate * initRate);
            drawCoord.paint();
            for(var i = 0; i < polygons.length; i++){
              polygons[i].changeScaleState(initRate);
              polygons[i].createScalePath();
              polygons[i].scaleStroke();
              polygons[i].scaleFill();
            }
  		      controls.updateList();  		          
  		      judge_start_time.innerText = polygon.stringifyStartTime;
  		      judge_end_time.innerText = polygon.stringifyEndTime;
  		      editingPloygon = polygon;
            editing = false;
  					return;
  				}
  		})
  	}else{

      console.log(mousedown.x);

      if(mousemoveFlag && pointIsInPolygons(polygons, loc)){
        loc.x = mousemoveEndPosition.x;
      }
      if(mousedown.x){
        util.restoreDrawingSurface(audio_bg, surfaceData);
        if(Math.abs(mousedown.x - loc.x) < 10) return;
        bgDrawRubberband(loc);
        controls.updateList();
        mousedown.x = null;
        mousedown.y = null;
        return;
      }		
  	} 	
  } 
  // data 音频数组
  // time 时长
  // frequency 码率
  // with 每秒对应长度
  // height y轴坐标高度
  function selectData(data, time, frequency, width, height){
	  	
      var selectWidth = Math.floor(frequency / width);
	  	var selectData = [];

	  	var num = Math.floor(time  *  width);
      
      for(var i = 0; i < num; i++){
        var sum1 = 0;
        var sum2 = 0;
        var index1 = 0;
        var index2 = 0;
        var item = [];
        for(var k = 0; k < selectWidth; k++){
          if(data[i*selectWidth + k] >= 0){
            index1++;
            sum1 = data[i*selectWidth + k] + sum1;
          }else{
            index2++;
            sum2 = data[i*selectWidth + k] + sum2;
          }
        }
        item.push(Math.floor(sum1/index1));
        item.push(Math.floor(sum2/index2));

        selectData.push(item);
      }
      var max = 0;
      for(var j = 0; j < selectData.length; j++){
        if(selectData[j][0] > max){
          max = selectData[j][0] 
        }
        if(Math.abs(selectData[j][1]) > max){
          max = Math.abs(selectData[j][1]);
        }
      }
      for(var k = 0; k < selectData.length; k++){
        selectData[k][0] = (selectData[k][0] / max) * height;        
        selectData[k][1] = (selectData[k][1] / max) * height;
      }
	  	return selectData;
	}
}