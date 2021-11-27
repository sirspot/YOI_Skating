let g_ScoreMessage = null;
let g_ScoreMessageTimer = null;
let g_ScoreMessageAnimate = null;
let g_ScoreMessageStartPos = [0,0];
let g_ScoreMessageEndPos = null;

let g_ScoreJumpCounter = null;
let g_ScoreJumpLevel = 0;
const g_ScoreJumpLevelMax = 15;
const g_ScoreJumpLevelMin = 3;

function ShowScore(message, showFor, allowAnimate)
{
    let animateText = false;
    if(g_ScoreMessage == null)
    {
        g_ScoreMessage = new Label(
            {
                size:40,
                font:"Verdana",
                color:"rgba(255,255,255,1)",
                align:"center",
                lineHeight:50
            }
        );

        g_ScoreJumpCounter = new Label(
            {
                size:40,
                font:"Verdana",
                color:"rgba(255,255,255,0)",
                align:"center",
                lineHeight:50
            }
        );
    }
    else
    {
        animateText = true;
        if(g_ScoreMessageEndPos == null)
        {
            g_ScoreMessageEndPos = [g_ScoreMessage.x, g_ScoreMessage.y];

            g_ScoreJumpCounter.addTo(g_ScoreMessage.parent);
            g_ScoreJumpCounter.x = g_ScoreMessageEndPos[0];
            g_ScoreJumpCounter.y = g_ScoreMessageEndPos[1] - 52;
            SetJumpPower(0);
        }
    }

    if(g_ScoreMessageTimer)
    {
        g_ScoreMessageTimer.clear();
        g_ScoreMessageTimer = null;
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
        g_ScoreMessageTimer = timeout(showFor, function()
            {
                g_ScoreMessage.text = "";
            }
        );
    }

    return g_ScoreMessage;
}

function SetJumpPower(level)
{
    let powerText = "";
    let i = 0;
    while((i < level) && (i < g_ScoreJumpLevelMax))
    {
        powerText = powerText + "|";
        i++;
    }
    if(g_ScoreJumpLevel != i)
    {
        g_ScoreJumpCounter.text = powerText;
        g_ScoreJumpLevel = i;
        let levelMultiplier = (g_ScoreJumpLevel / g_ScoreJumpLevelMin);
        if(levelMultiplier >= 3)
        {
            // 9 and higher
            g_ScoreJumpCounter.color = "rgba(50,255,50,1)";
        }
        else if(levelMultiplier >= 2)
        {
            // 6 and higher
            g_ScoreJumpCounter.color = "rgba(150,255,150,.9)";
        }
        else if(levelMultiplier >= 1)
        {
            // 3 and higher
            g_ScoreJumpCounter.color = "rgba(255,255,255,.8)";
        }
        else
        {
            g_ScoreJumpCounter.color = "rgba(200,200,200,.7)";
        }
    }
}

function IncreaseJumpPower()
{
    SetJumpPower(g_ScoreJumpLevel + 1);
}

function DecreaseJumpPower()
{
    let newJumpLevel = 0;
    if(g_ScoreJumpLevel > g_ScoreJumpLevelMin)
    {
        newJumpLevel = g_ScoreJumpLevel - g_ScoreJumpLevelMin;
    }
    SetJumpPower(newJumpLevel);
}

function HasJumpPower()
{
    return (g_ScoreJumpLevel >= g_ScoreJumpLevelMin);
}
