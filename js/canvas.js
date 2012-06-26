$("show").addEvent('click',function(){this.set({styles:{visibility:'hidden'}}); 
                                          $("hide").set({styles:{visibility:'visible'}});
                                          $("layer").set({styles:{visibility:'visible'}});
                                          showCanvas();
                                          });
$("hide").addEvent('click',function(){this.set({styles:{visibility:'hidden'}});
                                         $("show").set({styles:{visibility:'visible'}});
                                         $("layer").set({styles:{visibility:'hidden'}});});

function showCanvas()
{
 concole.log("haha");
};