let g_SpotLightBlob = null;
let g_SpotLightOn = false;
let g_SpotLightPoints = null;
const g_SpotLightsFloorWidth = 300;
const g_SpotLightsHalfFloorWidth = (g_SpotLightsFloorWidth/2);

function ShowSpotLight()
{
    let xStart = -100;
    g_SpotLightPoints = [
        [-10,0],
        [10,0],
        [xStart + g_SpotLightsHalfFloorWidth,480],
        [xStart - g_SpotLightsHalfFloorWidth,480]
     ];
    g_SpotLightBlob = new Blob({
        controlType:"none",
        points:g_SpotLightPoints,
        showControls: false,
        interactive: false,
     });
     g_SpotLightBlob.color = new GradientColor(["rgba(255,255,225,.5)","rgba(225,225,165,.1)"], [0,1], 0,0, 0,500);
     g_SpotLightBlob.alpha = 0;

     return g_SpotLightBlob;
}

function MoveSpotLight(x)
{
    let distanceDifference = (x - g_SpotLightBlob.x);
    let xMax = g_SpotLightBlob.parent.width;
    let distanceMultiplier = 3*(Math.abs(distanceDifference)/xMax);
    if(distanceMultiplier < 1)
    {
        distanceMultiplier = 1;
    }
    let newPoints = [...g_SpotLightPoints];
    newPoints[2][0] = distanceDifference + (g_SpotLightsHalfFloorWidth*distanceMultiplier);
    newPoints[3][0] = distanceDifference - (g_SpotLightsHalfFloorWidth*distanceMultiplier);
    g_SpotLightBlob.points = newPoints;
}

function SpotLightOn()
{
    if(g_SpotLightOn == false)
    {
        g_SpotLightBlob.alpha = 1;
        /*
        g_SpotLightBlob.stopAnimate();
        g_SpotLightBlob.animate({
            props:{alpha:1},
            time:.15,
            from:true,
            dynamic:true,
            protect:true
         });*/
         g_SpotLightOn = true;
    }

}

function SpotLightOff()
{
    if(g_SpotLightOn)
    {
        g_SpotLightBlob.alpha = 0;
        /*
        g_SpotLightBlob.stopAnimate();
        g_SpotLightBlob.animate({
            props:{alpha:0},
            time:.15,
            from:true,
            dynamic:true,
            protect:true
        });*/
        g_SpotLightOn = false;
    }
}
