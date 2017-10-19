window.onload = function(){
  
  // select() ==>  document.getElementById()
      // audio控件
  var audio = select('audio'),
      // 开始
      play = select('play'),
	  // 暂停
      pause = select('pause'),
	  // 重播
      restart = select('restart'),
	  // 文件控件
      file_input = select('file_list'),	
	  // var setTime = select('setTime');	
	  edit_checkbox = select('editCheckbox'),
	  // canvas
	  audio_bg = select('audio_bg'),
	  audio_rect = select('audio_rect'),
	  // canvas context
	  context = audio_rect.getContext('2d'),
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
      // 游标绘制前数据
      beforeVernierData,
      // 鼠标位置坐标
      mousedown = {},
      // 鼠标移动最后坐标
      mousemovePosition = {},
      // 是否在拖动 
      rectDrag = false,
      // 移动 拉伸起始点
      draggingStartX,
	  // 指示线
      guidewires = true,
      // 在矩形内
      isInPolygons = false,
      // 时间比率 100px/s or 10px/s
      timeRate,
      // 音频宽度
      audioWaveWidth,
      // 坐标原点 x   
      coordOffsetX = 20.5, //10.5
      // 坐标原点 y
      coordOffsetY = parseInt(audio_bg.height / 2), // 200 / 2  100
      // 定时器
      currentTimeFlag,
      // 左边界
      leftBoundary,
      // 右边界
      rightBoundary,
      // 选中的ploygon
      editingPloygon,
      // play
      playFlag = 0;

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
      view.renderAudioRect();
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
    renderAudioRect: function(){
      context.clearRect(0, 0, audio_rect.width, audio_rect.height);
      drawRects();
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


  // Rubberbands
	// 绘制橡皮框
	function drawRubberbandShape(loc) {
	   if(mousedown.x == loc.x) return;

     if(mousedown.x > loc.x){
      var x = loc.x;
      loc.x = mousedown.x;
      mousedown.x = x;
     }

	   if(rectDrag){
	   		var rect = new DrawRect(mousedown.x, mousedown.y, loc.x, audio_rect.height, audio_rect, coordOffsetX, timeRate);
	  		drawRect(rect);
	   }else{
	   		if(Math.abs(mousedown.x - loc.x) < 10) return;
	   		var rect = new DrawRect(mousedown.x, mousedown.y, loc.x, audio_rect.height, audio_rect, coordOffsetX, timeRate);
	  		drawRect(rect);
	   }	  
	   

	   if(!rectDrag){
       // rect.startTime = (rect.x1 - coordOffsetX) / timeRate;
       // rect.endTime = (rect.x2 - coordOffsetX) / timeRate;
       judge_start_time.innerText = rect.stringifyStartTime;
       judge_end_time.innerText = rect.stringifyEndTime;

       editingPloygon = rect;

	   	 if(polygons.length == 0){
	   	 	polygons.push(rect);
	   	 	return;
	   	 }else if(polygons.length == 1){
	   	 	if(rect.x2 < polygons[0].x1){
	   	 		polygons.unshift(rect);
	   	 		return;
	   	 	}else if(rect.x1 > polygons[0].x2){
	   	 		polygons.push(rect);
	   	 		return;
	   	 	}
	   	 }else{
	   	 	for(var i = 0; i < polygons.length; i++){
	   	       if(rect.x2 < polygons[i].x1 ){
	   	       	    if(i === 0){
	   	       	    	polygons.unshift(rect)
	   	       	    	return; 
	   	       	    }else if(rect.x1 > polygons[i - 1].x2){
	   	       	    	polygons.splice( i , 0, rect)
	   	       	    	return;
	   	       	    }	   	       		
	   	       }else {
	   	          if(rect.x1 > polygons[polygons.length - 1].x2){
	   	          	polygons.push(rect)
	   	          	return;
	   	          }
	   	       }
	   	   }
	   	 }	   	   
	   }
	}
	// 更新橡皮框
	function updateRubberband(loc) {
	   drawRubberbandShape(loc);
	}
	// 矩形绘制
	function drawRect(rect){
		rect.createPath();
		rect.stroke();
		rect.fill();
	}
	// 绘制全部矩形
	function drawRects(){
		polygons.forEach(function(polygon){
			drawRect(polygon);
		});
	}
	// 绘图状态开始拖动/鼠标按下
	function startDragging(loc){
		surfaceData = util.saveDrawingSurface(audio_rect);
		mousedown.x = loc.x;
		mousedown.y = 0;
	}
	// 开始编辑
	function startEditing(canvas){
		canvas.style.cursor = 'pointer';
		editing = true;
	}
	// 结束编辑
	function endEditing(canvas){
		editing = false
	}

	
	var util = new Util();
	// mousedown
	audio_rect.addEventListener('mousedown', function(e){
		e.stopPropagation();
		e.preventDefault();
	    if (audio.src === '') {
	      alert('请选择音频文件。。。');

	      return; 
	    }
		var loc = util.windowToCanvas(audio_rect, e.clientX,e.clientY);
	    if(loc.x < coordOffsetX) return;
	 
			// 编辑状态
			if(editing){
				polygons.forEach(function(polygon){
					polygon.createPath();
					// 判断点是否在矩形内 
					if(context.isPointInPath(loc.x, loc.y)){
						if(polygon.isPointInLeft(loc)){
							audio_rect.style.cursor = 'crosshair';
							polygon.isInLeft = true
						}
						if(polygon.isPointInRight(loc)){
							audio_rect.style.cursor = 'crosshair';
							polygon.isInRight = true
						}
						// 清除
						context.clearRect(0, 0, audio_rect.width, audio_rect.height);
						// 将矩形设为选中状态
						polygon.selected = true;
						
						rectDrag = polygon;

						// 重绘矩形
						drawRects();

						// 记录开始移动的点
						draggingStartX = loc.x;
						return;
					}
				})
			}else{  //绘图状态			
				if(polygons.length != 0){ // 已存在矩形时
					var flag = false
					polygons.forEach(function(polygon){
						polygon.createPath();
						if(context.isPointInPath(loc.x, loc.y)){
							flag = true
						}
					})
					if(!flag){
						startDragging(loc);
						rectDrag = true;
					}else{
						
						isInPolygons = true;
					}
				}else{
					startDragging(loc);
					rectDrag = true;
				}			
			}
	})
	// 判断点是否在矩形中
	function pointIsInPolygons(polygons, loc){
		for(var i = 0; i < polygons.length; i++){			
			if(polygons[i].isPointIn(loc)){
				return true
			}
		}
		return false
	}
  // mousemove
	audio_rect.addEventListener('mousemove', function(e){
		e.stopPropagation();
		e.preventDefault();
		var loc = util.windowToCanvas(audio_rect, e.clientX, e.clientY);		
		if(editing){
			var i = 0;
			polygons.forEach(function(polygon){
				polygon.createPath();
				if(context.isPointInPath(loc.x, loc.y)){
					if(polygon.isPointInLeft(loc) || polygon.isPointInRight(loc)){
						i = 1;
					}
				}
				if(i === 1){
					audio_rect.style.cursor = 'crosshair';
				}else if (i === 0){
					audio_rect.style.cursor = 'pointer';
				}
			})
		} 
		// 编辑状态
		if(editing && rectDrag){
			// 移动的距离
			var deltaX = loc.x - draggingStartX;
			draggingStartX = loc.x;
			// 矩形在数组中的位置
			var index = getPolygonIndex(polygons, rectDrag);
			// 改变矩形位置
			if(rectDrag.isInLeft){ //往左拉伸
				if (rectDrag.x2 - rectDrag.x1 - deltaX > 10) { //宽度不小于10					
					if(polygons[index - 1]){ //左边有矩形
						if(rectDrag.x1 + deltaX > polygons[index - 1].x2){
							rectDrag.changeX1(deltaX);
						}
					}else{ //左边没有矩形
						if(rectDrag.x1 + deltaX >= coordOffsetX){
							rectDrag.changeX1(deltaX);
						}
					}
				}			
			}else if(rectDrag.isInRight){  //往右拉伸
				if(rectDrag.x2 + deltaX - rectDrag.x1 > 10){ //宽度不小于10
					if(polygons[index + 1]){ //右边有矩形
						if(rectDrag.x2 + deltaX < polygons[index + 1].x1){
							rectDrag.changeX2(deltaX);
						}
					}else{ //右边没有矩形
						if(rectDrag.x2 + deltaX <= audio_rect.width){
							rectDrag.changeX2(deltaX);	
						}
					}
				}				
			}else {  //整体移动				
				if(deltaX <= 0){
					if(polygons[index - 1]){ //左边有矩形
						if(rectDrag.x1 + deltaX > polygons[index -1].x2){
							rectDrag.changePoints(deltaX);
						}
					}else{ //左边没有矩形
						if(rectDrag.x1 + deltaX >= coordOffsetX){
							rectDrag.changePoints(deltaX);
						}
					}
				}else{ 
					if(polygons[index + 1]){ //右边有矩形
						if(rectDrag.x2 + deltaX < polygons[index + 1].x1){
							rectDrag.changePoints(deltaX);
						}
					}else{ //右边没有矩形
						if(rectDrag.x2 + deltaX <= audio_rect.width){
							rectDrag.changePoints(deltaX);
						}
					}
				}
			}		
			context.clearRect(0, 0, audio_rect.width, audio_rect.height);
			// 重绘矩形
			drawRects();
			if(guidewires){
				util.drawGuidewires(audio_rect, loc.x, loc.y);
			}
		}else{  //
			// 绘图状态
			if(rectDrag){
				if(polygons.length != 0){
					var position = getPointPosition(polygons, mousedown);
					if(position === -1){  // 最左边
						if(loc.x >= coordOffsetX && loc.x < polygons[0].x1){
							util.restoreDrawingSurface( audio_rect ,surfaceData);
							updateRubberband(loc);
							
							mousemovePosition.x = loc.x;
							mousemovePosition.y = 0;
							if(guidewires){
								util.drawGuidewires(audio_rect, loc.x, loc.y);
							}	
						}
					}else if(position === - 2){  //最右边
						if(loc.x > polygons[polygons.length - 1].x2 && loc.x < audio_rect.width){
							util.restoreDrawingSurface( audio_rect ,surfaceData);
							updateRubberband(loc);
							
							mousemovePosition.x = loc.x;
							mousemovePosition.y = 0;
							if(guidewires){
								util.drawGuidewires(audio_rect, loc.x, loc.y);
							}	
						}
					}else {  //两个矩形之间
						if(loc.x > polygons[position].x2 && loc.x < polygons[position + 1].x1){
							util.restoreDrawingSurface( audio_rect ,surfaceData);
							updateRubberband(loc);

							mousemovePosition.x = loc.x;
							mousemovePosition.y = 0;
							if(guidewires){
								util.drawGuidewires(audio_rect, loc.x, loc.y);
							}	
						}
					}
				}else{
					util.restoreDrawingSurface( audio_rect ,surfaceData);
					updateRubberband(loc);

					mousemovePosition.x = loc.x;

					if(guidewires){
						util.drawGuidewires(audio_rect, loc.x, loc.y);
					}	
				}							
			}
		}		
	})
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
  // mouseup
	audio_rect.addEventListener('mouseup', function(e){
		e.stopPropagation();
		e.preventDefault();

		var loc = util.windowToCanvas(audio_rect, e.clientX, e.clientY);

	    if (loc.x < coordOffsetX) return;
			rectDrag = false;

			if(editing){
				polygons.forEach(function(polygon){
					polygon.createPath();
					if(context.isPointInPath(loc.x, loc.y)){
						context.clearRect(0, 0, audio_rect.width, audio_rect.height);					
						polygon.selected = false;
						polygon.isInLeft = false;
						polygon.isInRight = false;					
						drawRects();

			            controls.updateList();
			          
			            judge_start_time.innerText = polygon.stringifyStartTime;
			            judge_end_time.innerText = polygon.stringifyEndTime;

			            editingPloygon = polygon;
						return;
					}
				})
			}else{	
				if(!isInPolygons){
					if(mousemovePosition.x != loc.x){
						loc.x = mousemovePosition.x;
					}
					util.restoreDrawingSurface(audio_rect, surfaceData);
					updateRubberband(loc);
	        		controls.updateList();
	        		return;
				}else{
					isInPolygons = false;
	        		return;
				}						
		}
	})

	// checkbox change
	edit_checkbox.addEventListener('change', function(e){
		e.stopPropagation();
		e.preventDefault();

		if(editCheckbox.checked){
			startEditing(audio_rect);			
		}else{
			endEditing(audio_rect);
		}
	})

  document.addEventListener('keydown', function(e){
    if(e.keyCode === 69){
      startEditing(audio_rect);
    }
  })

  document.addEventListener('keyup', function(e){
    if(e.keyCode === 69){
      endEditing(audio_rect)
    }
  })
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
    
 

  play.addEventListener('click', function(e){
    e.stopPropagation();
    e.preventDefault();
    
    if( audio.paused ) {
    	audio.play();

      clearInterval(currentTimeFlag);
      // 游标
      var drawVernier = new DrawVernier(coordOffsetX, coordOffsetY, coordOffsetY - 60, audio_bg)
      drawVernier.paint()
      var startTime = 0 //记录开始播放时间
      currentTimeFlag = setInterval(function(){

        bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);
        util.restoreDrawingSurface(audio_bg, beforeVernierData);
        if(audio.currentTime === audio.allTime){
          clearInterval(currentTimeFlag);          
          drawVernier.paint();
          return;
        } 
        var deltaTime = audio.currentTime - startTime;
        startTime = audio.currentTime;     
        drawVernier.x = drawVernier.x + deltaTime * timeRate; 
        drawVernier.paint();
      },20)
    }
    
    
  })
  pause.addEventListener('click', function(e){
    e.stopPropagation();
    e.preventDefault();
    
    if( !audio.paused ) {
    	audio.pause();
      clearInterval(currentTimeFlag);
    }
  })
  restart.addEventListener('click', function(e){
    e.stopPropagation();
    e.preventDefault();

    clearInterval(currentTimeFlag);
    
    audio.currentTime = 0;
    if(audio.paused){
      audio.play();
    }
    var drawVernier = new DrawVernier(coordOffsetX, coordOffsetY, coordOffsetY - 60, audio_bg)
    drawVernier.paint()
    var startTime = 0 //记录开始播放时间
    currentTimeFlag = setInterval(function(){
      bg_context.clearRect(0, 0, audio_bg.width, audio_bg.height);
      util.restoreDrawingSurface(audio_bg, beforeVernierData);
      if(audio.currentTime === audio.allTime){
        clearInterval(currentTimeFlag);          
        drawVernier.paint();
        return;
      } 
      var deltaTime = audio.currentTime - startTime;
      startTime = audio.currentTime;     
      drawVernier.x = drawVernier.x + deltaTime * timeRate; 
      drawVernier.paint();
    },20)
  })
  
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

          console.log('wf.onload');         
          // 重置状态
          clearInterval(currentTimeFlag);  
          context.rect(0, 0, audio_rect.width, audio.height);
          if(polygons.length){
            polygons = [];
            view.renderBarAfterDel();
            view.renderReaultList();
          }    
          var data = wf.getData();            
          var time = wf.getTime();
          var frequency = wf.getFrequency();

          // 设置audio的src和总时长
          audio.src = file_input.files[fileIdx].name;
          audio.allTime = time;

          if(time <= 60 && time > 0){
            timeRate = 100;
          }else if(time > 60){
            timeRate = 10;
          }

          console.log(data);
          console.log(data.length);

          console.log(time);
          console.log(frequency);
          console.log(time * frequency);
          // selectData
          console.log('selectData');

          var changedData = selectData(data, time, frequency, timeRate, audio.height / 2);

          // 刷选音频数据
          // var changedData = changeData(data, time, frequency, timeRate, audio_bg.height / 2);

          // 音频宽度
          audioWaveWidth = time * timeRate ;

          rightBoundary = audioWaveWidth + coordOffsetX;

          

          // 背景层canvas宽度
          audio_bg.width = Math.round(time + 1) * timeRate > 800 ? Math.round(time + 1) * timeRate : 800;

          // 操作层canvas宽度
          audio_rect.width = rightBoundary;

          // 背景网格
          var gridWidth = 70;
          var griHeight = 20;
          var drawBcakgrounGrid = new DrawBcakgrounGrid(audio_bg, gridWidth, griHeight);
          drawBcakgrounGrid.paint();        
          // 音频信号
          console.log('原点Y');
          console.log(coordOffsetY)
          var drawLine = new DrawLine(audio_bg, changedData, coordOffsetX, coordOffsetY);
          drawLine.paint(); 
          // 坐标轴
          var drawCoord = new DrawCoord(audio_bg, coordOffsetX, coordOffsetY, timeRate);
          drawCoord.paint();
          beforeVernierData = util.saveDrawingSurface(audio_bg);                  
      });
  }
  // wav文件
  WavFile = function(filePath) {
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
  // data 音频数组
  // time 时长
  // frequency 码率
  // with 每秒对应长度
  // height y轴坐标高度
  
  function changeData(data, time, frequency, width, height){
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
  }

  function selectData(data, time, frequency, width, height){
  	var selectWidth = Math.floor(frequency / width);
  	var selectData = [];
  	// 
  	var num = Math.floor(time  *  width);

  	for(var i = 0 ; i < num; i++){
  		var sum = 0;
  		var sum1 = 0;
  		var sum2 = 0;

  		for(var j = 0; j < selectWidth; j++){
  			if(data[i + j] >= 0){
  				sum1 = sum1 + data[i + j];
  			}
  			if(data[i + j] < 0){
  				sum2 = sum2 + data[i + j];
  			}

  			sum = sum + data[i + j]; 
  		}
  		var avg = Math.round(sum / selectWidth);

  		console.log("sum and avg:" + i);
  		console.log(sum1);
  		console.log(sum2);
  		console.log(sum);
  		console.log(selectWidth);
  		console.log(avg);
  		selectData.push(avg);
  	}

  	for(var k = 0; k < selectData.length; k++){
  		if(selectData[k] > height ){
  			selectData[k] = height
  		}
  	}
  	return selectData;
  }



}