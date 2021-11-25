let g_ScoreMessage = null;
let g_ScoreMessageTimer = null;
let g_ScoreMessageAnimate = null;
let g_ScoreMessageStartPos = [0,0];
let g_ScoreMessageEndPos = [0,0];

function ShowScore(message, showFor, allowAnimate)
{
    let animateText = false;
    if(g_ScoreMessage == null)
    {
        g_ScoreMessage = new Label(
            {
                size:42,
                font:"Verdana",
                color:"rgba(255,255,255,1)",
                align:"center",
                lineHeight:50
            }
        );
    }
    else
    {
        animateText = true;
        g_ScoreMessageEndPos = [g_ScoreMessage.x, g_ScoreMessage.y];
    }

    g_ScoreMessage.text = message;

    if(animateText && allowAnimate === true)
    {
        g_ScoreMessageStartPos = [g_ScoreMessageEndPos[0],g_ScoreMessageEndPos[1]-10];
        g_ScoreMessage.scale = .1;
        g_ScoreMessage.x = g_ScoreMessageStartPos[0];
        g_ScoreMessage.y = g_ScoreMessageStartPos[1];
        g_ScoreMessage.animate(
                {
                    x:g_ScoreMessageEndPos[0],
                    y:g_ScoreMessageEndPos[1],
                    scale:1
                },
                0.15
            );
    }

    if(showFor > 0)
    {
        if(g_ScoreMessageTimer)
        {
            g_ScoreMessageTimer.clear();
            g_ScoreMessageTimer = null;
        }
        g_ScoreMessageTimer = timeout(showFor, function()
            {
                g_ScoreMessage.text = "";
            }
        );
    }

    return g_ScoreMessage;
}
