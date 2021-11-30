let g_ScoreMessage = null;
let g_ScoreMessageBox = null;
let g_ScoreMessageTimer = null;
let g_ScoreMessageAnimate = null;
let g_ScoreMessageStartPos = [0,0];
let g_ScoreMessageEndPos = null;

let g_ScoreJumpPower = null;
let g_ScoreJumpPowerBox = null;
let g_ScoreJumpLevel = -1;
const g_ScoreJumpLevelMax = 14;
const g_ScoreJumpLevelMin = 3;

function ShowScore(message, showFor, allowAnimate)
{
    let animateText = false;
    if(g_ScoreMessageBox == null)
    {
        //
        // SCORE MESSAGE
        //
        g_ScoreMessageBox = new Rectangle(
                {
                    color:"rgba(0,0,0,.5)",
                    width:400,
                    height:120
                }
            ).centerReg();
        g_ScoreMessage = new Label(
                {
                    size:25,
                    font:"Verdana",
                    color:"rgba(255,255,255,1)",
                    align:"center",
                    lineHeight:30
                }
            ).centerReg().addTo(g_ScoreMessageBox).pos(170,30);
        g_ScoreMessageEndPos = [g_ScoreMessage.x, g_ScoreMessage.y];

        //
        // JUMP POWER
        //
        g_ScoreJumpPowerBox = new Rectangle(
            {
                color:"rgba(0,0,0,.5)",
                width:400,
                height:45
            }
        ).centerReg().addTo(g_ScoreMessageBox).pos(0,130);
        g_ScoreJumpPower = new Label(
            {
                size:30,
                font:"Verdana",
                color:"rgba(255,255,255,0)",
                align:"left",
                lineHeight:40
            }
        ).centerReg();
        g_ScoreJumpPower.addTo(g_ScoreJumpPowerBox).pos(10,0);
        SetJumpPower(0);
    }
    else
    {
        animateText = true;
    }

    //
    // SCORE MESSAGE TIMER RESET
    //
    if(g_ScoreMessageTimer)
    {
        g_ScoreMessageTimer.clear();
        g_ScoreMessageTimer = null;
    }

    //
    // SET SCORE MESSAGE
    //
    g_ScoreMessage.text = message;
    if(message.includes("\n"))
    {
        g_ScoreMessage.size = 25;
    }
    else
    {
        g_ScoreMessage.size = 40;
    }
    g_ScoreMessage.centerReg().center(g_ScoreMessageBox);

    if(animateText && allowAnimate === true)
    {
        //
        // ANIMATE SCORE MESSAGE
        //
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
        //
        // SCORE MESSAGE TIMER START
        //
        g_ScoreMessageTimer = timeout(showFor, function()
            {
                g_ScoreMessage.text = "";
            }
        );
    }

    return g_ScoreMessageBox;
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
        g_ScoreJumpLevel = i;
        let powerDescription = "";
        powerDescription = "Jump Power";
        let levelMultiplier = (g_ScoreJumpLevel / g_ScoreJumpLevelMin);
        if(levelMultiplier >= 3)
        {
            // 9 and higher
            g_ScoreJumpPower.color = "rgba(50,255,50,1)";
        }
        else if(levelMultiplier >= 2)
        {
            // 6 and higher
            g_ScoreJumpPower.color = "rgba(150,255,150,.9)";
        }
        else if(levelMultiplier >= 1)
        {
            // 3 and higher
            g_ScoreJumpPower.color = "rgba(255,255,255,.8)";
        }
        else
        {
            g_ScoreJumpPower.color = "rgba(200,200,200,.7)";
        }
        g_ScoreJumpPower.text = powerDescription + " " + powerText;
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
