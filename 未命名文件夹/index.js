window.onload = function(){
  var audio_bg = document.getElementById('audio_bg');
  var file_input = document.getElementById('file_list');
	

  var fileIndex;
  var selectDataInterval;
  var timeLengthRate;

  var controls = {
    fileChange: function(e){
      e.stopPropagation();
      e.preventDefault();
      fileIndex = 0;
      controls.loadData()
    },
    loadData: function(order = 1){
      if(file_input.files.length === 0) return;
      var fileName = file_input.files[fileIndex].name;
      var len = fileName.length;
      while(fileName.slice(len - 3, len) != 'wav'){
        if(order == 1){
          ++fileIndex;
        }else{
          --fileIndex;
        }
        fileName = file_input[fileIndex].name;
        len = fileName.length;
      }
      var wf = new WavFile(file_input.files[fileIndex]);
      wf.onload(function(){
        console.log('onload')
        var data = wf.getData();
        var time = wf.getTime();
        var frequency = wf.getFrequency();

        if(time <= 60 && time >0){
          timeLengthRate = 100;
        }else{
          timeLengthRate = 10;
        }
        var selectedData = controls.selectedData(data, time, frequency, timeLengthRate, audio_bg.height/2);
        console.log(audio_bg)
        var drawBackgrounGrid = new DrawBackgroundGrid(audio_bg, 70, 20);
        drawBackgrounGrid.paint();
        
        
      })
    },
    //  selecte audio data before draw wave
    selectedData: function(data, time, frequency, timeLengthRate, valueHeight){
      var selectedWidth = Math.floor(frequency / timeLengthRate);
      var selectedData = [];
      // select arr
      for(var i = 0; i < data.length; i++){
        if((i % selectedWidth) == 0){
          selectedData.push(data[i])
        }
      }
      // change each arr value
      for(var j = 0; j < selectedData.length; j++){
        if(Math.abs(selectedData[j]) * 0.1 > valueHeight){
          if(Math.abs(selectedData[i]) / selectedData[j] > 0){
            selectedData[j] = (Math.abs(selectedData[j]) / selectedData[j]) * valueHeight - 30 + 30 * Math.random();
          }else{
            selectedData[j] = (Math.abs(selectedData)[j] / selectedData[j]) * valueHeight + 30 - 30 * Math.random()
          }
        }else{
          selectedData[j] = parseInt(selectedData[j] * 0.1);
        }
      }
      return selectedData;
    }
    
  }

  file_input.addEventListener('change', controls.fileChange, false)
   
	
}