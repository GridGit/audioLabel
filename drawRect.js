

var drawingSurfaceImageData,
    mousedown = {},
    rubberbandRect = {},
    dragging = false;

function windowToCanvas(x, y) {
   var bbox = audio_bg.getBoundingClientRect();
   return { x: x - bbox.left * (audio_bg.width  / bbox.width),
            y: y - bbox.top  * (audio_bg.height / bbox.height) };
}

function saveDrawingSurface() {
   drawingSurfaceImageData = context.getImageData(0, 0,
                             audio_bg.width,
                             audio_bg.height);
}

function restoreDrawingSurface() {
   context.putImageData(drawingSurfaceImageData, 0, 0);
}

function updateRubberbandRectangle(loc) {
   rubberbandRect.width  = Math.abs(loc.x - mousedown.x);
   rubberbandRect.height = Math.abs(loc.y - mousedown.y);

   if (loc.x > mousedown.x) rubberbandRect.left = mousedown.x;
   else                     rubberbandRect.left = loc.x;

   if (loc.y > mousedown.y) rubberbandRect.top = mousedown.y;
   else                     rubberbandRect.top = loc.y;

   context.save();
   context.strokeStyle = 'red';
   context.restore();
} 

function drawRubberbandShape(loc) {
   context.save()
   context.beginPath();
   context.rect(mousedown.x, mousedown.y, rubberbandRect.width, rubberbandRect.height)
   context.strokeStyle = 'yellow';
   context.stroke();
   context.closePath()
   context.restore();
}

function updateRubberband(loc) {
   updateRubberbandRectangle(loc);
   drawRubberbandShape(loc);
}


audio_bg.onmousedown = function (e) {
   var loc = windowToCanvas(e.clientX, e.clientY);
   
   e.preventDefault(); // prevent cursor change

   console.log(loc)
   saveDrawingSurface();
   mousedown.x = loc.x;
   mousedown.y = loc.y;
   dragging = true;
};

audio_bg.onmousemove = function (e) {
   var loc; 

   if (dragging) {
      e.preventDefault(); // prevent selections

      loc = windowToCanvas(e.clientX, e.clientY);
      restoreDrawingSurface();
      updateRubberband(loc);
   }
};

audio_bg.onmouseup = function (e) {
   loc = windowToCanvas(e.clientX, e.clientY);
   restoreDrawingSurface();
   updateRubberband(loc);
   dragging = false;
};

