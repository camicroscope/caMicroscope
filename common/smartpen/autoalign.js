//requires enhance and tippy module

/* class for align */
class smartpen{
  constructor(){
    this.init();
  }
  init(){
    this.canvas;
    this.context;
    this.threshold = this.t = 90;
    this.smoothness= 4*4;
    this.radius = 30;
    this.mode = 0;
    // 0 for Off, 1 for after finish, 2 for realtime
    this.menubar;
    this.menuon = false;
    this.undo;
  }
  initcanvas(canvas){
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }
  // call edge detection
  detect(x1,y1,x,y,ch=4){
      var newdata = this.context.getImageData(x1,y1,x,y);
      var dst = edgedetect_canny(newdata,~~(this.t/1.5),this.t,5,1.8,ch);
      return dst;
  }
  // collects edges
  edge(x1,y1,x,y){
     var dist = [];
     var temp = this.detect(x1,y1,x,y,1);
     var l = temp.data;
     for (var i = x1;i<x1+x;i++)
       for(var j = y1;j<y1+y;j++){
         var e = l[(j-y1)*x+i-x1];
         if(e>200)
           dist.push({x:i,y:j})
       }
   return dist;
   }
  // get optimum pts for a stroke
  apply(arr){
      var n = 3, th = this.smoothness, lambda=1.5;
      var pop = [],clean=[], mod1=[], mod2=[], final=[], nearest = [], pts = [], f = arr.length-1,f1=0,f2=0, prev;

      //populate
      for(var i=0;i<=f-1;i++){
        var d = this.distance(arr[i],arr[i+1]);
        var m = spen.min([~~(Math.sqrt(d)/4), 150]);
        if(d>=64)pop.push(...this.populate([arr[i],arr[i+1]],m));
        else pop.push(arr[i]);}
      pop.push(arr[f]);
      f = pop.length-1;
      // clean
      clean.push(pop[0]);
      for(var i=1;i<=f;i++)
         if(!this.eqlpt(pop[i],pop[i-1]))
            clean.push(pop[i]);
      f = clean.length-1;
      // Nearest
      for(var i = 0;i<=f;i++){
        var c = this.nearest(clean[i],true);
        nearest.push(c[0]);
        pts.push(c[1]);}
      // Continuity Heuristic 1
      for(var i = 0; i<=f ;i++){
        var mean = this.average(nearest,i,n);
        var dist = pts[i], mind = 10e10,point = clean[i],near=clean[i];
        for(var j =0;j<dist.length;j++){
            var d = lambda*this.distance(point,dist[j])+this.distance(mean,dist[j]);
            if(d<mind){
                mind = d;
                near = dist[j];}}
        mod1.push(near);
        f1+=this.eqlpt(near,nearest[i]);f2+=1;}
      f1=0;f2=0;
      //console.log("heuristic 1: ", f1/(f2-f1));
      // Continuity Heuristic 2
      for(var i = 0; i<=f ;i++){
        var mean = this.average(mod1,i,n);
        if (this.distance(mean,mod1[i])>th){
            mod2.push(mean);f1++;}
        else {mod2.push(mod1[i]);f2++;}}
      //console.log("heuristic 2: ",f2/f1);
      // copy
      console.log(f);
      for(var i = 0; i<=f ;i++)
          final.push(mod2[i]);
      return final;
    }
    // get optimum pt for a pt
    nearest(point,all = false){
      var r = this.radius
      var x1 = this.max([point.x-Math.floor(r/2),0])
      var y1 = this.max([point.y-Math.floor(r/2),0])
      var x = this.min([r,this.canvas.width-x1])
      var y = this.min([r,this.canvas.height-y1])

      var dist = [], trials=3; this.t=this.threshold;
      while(!dist.length && --trials){
        dist = this.edge(x1,y1,x,y)
        this.t/=2;this.t=~~this.t;
      }
      var near = point;
      var d , mind = 1000000*100000;
      for(var i =0;i<dist.length;i++){
          var d = this.distance(point,dist[i]);
          if(d<mind){
              mind = d;
              near = dist[i];
          }
      }
      if(all)
        return [near,dist];
      else
        return near;
    }
    align_r(arr){
      if(this.mode==2)return this.nearest(arr);
      else return arr;
    }
    align(arr){
      if(this.mode==1)return this.apply(arr);
      else return arr;
    }
    // intepolates in between points
    populate(points,n){
        var ln = points.length, dist=[];
        for(var i = 0; i<ln-1; i++){
            var a=points[i],b=points[i+1];
            for(var j=0; j<n; j++){
                var x = a.x + j*(b.x-a.x)/n, y = a.y + j*(b.y-a.y)/n;
                dist.push({x:Math.floor(x),y:Math.floor(y)});}
        }
        return dist;
    }
    // distance function
    distance(pos1,pos2){
      return (pos1.x-pos2.x)*(pos1.x-pos2.x)+(pos1.y-pos2.y)*(pos1.y-pos2.y);
    }
    // average function
    average(mod1,i,n){
      var c=0, mean={x:0,y:0};
      for(var j=-n; j<=n ;j++){
        if(i+j>=mod1.length||j==0||(i+j)<0)continue;
        mean.x+=mod1[(i+j)].x
        mean.y+=mod1[(i+j)].y
        c+=1;}
      mean.x=~~(mean.x/c);mean.y=~~(mean.y/c);
      return mean;
    }
    // equal points
    eqlpt(a,b){
      if(a.x==b.x && a.y==b.y)return true;
      else return false;
    }
    max(a){
      var m = -100000000000;
      for(var i=0;i<a.length;i++){
        m = m>a[i]? m : a[i];
      }
      return m;
    }
    min(a){
      var m = 100000000000;
      for(var i=0;i<a.length;i++){
        m = m<a[i]? m : a[i];
      }
      return m;
    }

/**********************************************************/
// UI
    menu(x,y){
        if(this.menuon)return;
        this.init();
        this.menuon = true;

        var temp = `
        <input type="checkbox" id="align_flag1" style="display:none;">
        <input type="checkbox" id="align_flag2" style="display:none;">
        <button id="align_openbtn" style="z-index:602; width:100px;" class="material-icons">auto_graph</button>
        <button id="align_mode" class="material-icons">power_settings_new</button>
        <button id="align_undoalign" class="material-icons">fast_rewind</button>
        <button id="align_setting" class="material-icons">tune</button>
        <div id="align_sliders">
          <pre>Radius   </pre><input type="range" id="align_radius" max=70 min=7 value=30><span id="align_r">30</span>
          <br>
          <pre>Threshold</pre><input type="range" id="align_threshold" max=300 min=20 value=90><span id="align_t">90</span>
          <br>
          <pre>Roughness</pre><input type="range" id="align_smooth" max=10 min=1 value=4><span id="align_s">4</span>&nbsp;
        </div>`

        var dv = document.createElement('div');
        dv.style.textAlign = "center";
        dv.style.position = "absolute";
        dv.style.left = x+"%";dv.style.top = y+"%";
        dv.id = "align_menu";
        dv.style.zIndex = "601";
        dv.innerHTML = temp;
        document.getElementsByTagName("BODY")[0].appendChild(dv);
        this.menubar = dv;
        var children = dv.children;
        for(var i = 0; i<children.length;i++){
          children[i].style.left = x+"%";children[i].style.top = y+"%";children[i].style.position = "fixed";
        }

        var openbtn = document.getElementById("align_openbtn");
        var mode = document.getElementById("align_mode");
        this.undo = document.getElementById("align_undoalign");
        var setting = document.getElementById("align_setting");
        var radius = document.getElementById("align_radius");
        var threshold = document.getElementById("align_threshold");
        var smoothness = document.getElementById("align_smooth");
        var check1 = document.getElementById("align_flag1");
        var check2 = document.getElementById("align_flag2");
        var r = document.getElementById("align_r");
        var s = document.getElementById("align_s");
        var t = document.getElementById("align_t");
        var blink;
        openbtn.onclick = function (){
          check1.checked=!check1.checked;if(!check1.checked)check2.checked=false;}
        //logo change, blink and width
        mode.onclick = () => {
          this.mode = (this.mode+1)%3;
          if(this.mode == 0){
            mode.style.color="red";mode.innerHTML="power_settings_new";
            clearInterval(blink);openbtn.style.color="blue";}
          if(this.mode == 1){
            mode.style.color="green";mode.innerHTML="edit";
            blink=setInterval(() => {if(openbtn.style.color=="blue")openbtn.style.color="red";else openbtn.style.color="blue";}, 1000);}
          if(this.mode == 2)mode.innerHTML="motion_photos_on";}
        //this.undo.onclick;
        setting.onclick = function (){check2.checked=!check2.checked;}
        radius.onchange = () => {this.radius = Number(radius.value); r.innerHTML = this.radius;}
        threshold.onchange = () => {this.threshold = Number(threshold.value); t.innerHTML = this.threshold;}
        smoothness.onchange = () => {this.smoothness = Number(smoothness.value); if(this.smoothness == 10)this.smoothness = 1000; s.innerHTML = this.smoothness;}
        tippy(openbtn, {content: "SmartPen",placement: 'right',delay: 300,theme: 'light-border'});
        tippy(mode, {content: "Mode",placement: 'right',delay: 300,theme: 'light-border'});
        tippy(this.undo, {content: "Undo",placement: 'right',delay: 300,theme: 'light-border'});
        tippy(setting, {content: "Settings",placement: 'right',delay: 300,theme: 'light-border'});
    }
    close(){
      this.menubar.remove();
      this.menuon = false;
    }
}

var spen = new smartpen();
