let g_ScoreMessage = null;
let g_ScoreMessageTimer = null;

function ShowScore(message, showFor)
{
    if(g_ScoreMessage == null)
    {
        g_ScoreMessage = new Label(
            {
                size:42,
                font:"Verdana",
                color:"rgba(256,256,256,.9)",
                align:"center",
                lineHeight:50
            }
        );
    }

    g_ScoreMessage.text = message;

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
