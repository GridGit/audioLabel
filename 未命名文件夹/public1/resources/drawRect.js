

var drawingSurfaceImageData,
    mousedown = {},
    rubberbandRect = {},
    dragging = false;

function windowToCanvas(x, y) {
   var bbox = canvas.getBoundingClientRect();
   return { x: x - bbox.left * (canvas.width  / bbox.width),
            y: y - bbox.top  * (canvas.height / bbox.height) };
}

function saveDrawingSurface() {
   drawingSurfaceImageData = context.getImageData(0, 0,
                             canvas.width,
                             canvas.height);
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
   // context.beginPath();
   // context.moveTo(mousedown.x, mousedown.y);
   // context.lineTo(loc.x, loc.y);
   // context.stroke();
   // context.closePath();
   context.beginPath();
   // context.moveTo(mousedown.x, mousedown.y);
   // context.lineTo(loc.x, mousedown.y);
   // context.lineTo(loc.x, loc.y);
   // context.lineTo(mousedown.x, loc.y);
   // context.lineTo(mousedown.x, mousedown.y);
   context.rect(mousedown.x, mousedown.y, rubberbandRect.width, rubberbandRect.height)
   context.stroke();
   context.closePath()
   context.restore();
}

function updateRubberband(loc) {
   updateRubberbandRectangle(loc);
   drawRubberbandShape(loc);
}


canvas.onmousedown = function (e) {
   var loc = windowToCanvas(e.clientX, e.clientY);
   
   e.preventDefault(); // prevent cursor change


   saveDrawingSurface();
   mousedown.x = loc.x;
   mousedown.y = loc.y;
   dragging = true;
};

canvas.onmousemove = function (e) {
   var loc; 

   if (dragging) {
      e.preventDefault(); // prevent selections

      loc = windowToCanvas(e.clientX, e.clientY);
      restoreDrawingSurface();
      updateRubberband(loc);
   }
};

canvas.onmouseup = function (e) {
   loc = windowToCanvas(e.clientX, e.clientY);
   restoreDrawingSurface();
   updateRubberband(loc);
   dragging = false;
};

