
const SkaterState_e =
{
	IDLE: 0,
	WALKING: 1,
	STANDING: 2,
	SKATING: 3,
	JUMPING: 4,
	JUMPED: 5,
	SPINNING: 6,
	LANDING: 7,
	LANDED: 8,
	COUNT: 9
};

const SkaterLocation_e =
{
	INIT: 0,
	GROUND: 1,
	RINK_ICE: 2,
	RINK_AIR: 3,
	COUNT: 4
};

const g_SkaterBoostMax = 3;

const g_YuriKatsuki =
{
	m_SkaterAssetFilename: "yoi_skating_spritesheet_yuri_katsuki.png",
	m_SkaterAsset: null,

	m_SkaterWidth: 0,
	m_SkaterHeight: 0,

    m_SkaterState: SkaterState_e.IDLE,
	m_SkaterLocation: SkaterLocation_e.INIT,

	m_SkaterSpritePhysicsSettings:
    {
        friction:0,
        bounciness:0,
        maskBits:1,
        categoryBits:1
    },

    m_SkaterSpriteSettings:
    {
        image:null,
        cols:16,
        rows:6,
        animations:
        {
            idle:[0,0],
            bend:{frames:[18,0]},
            walk:[16,31],
            skate:[48,57],
            stand:[32,32],
            spin:[64,69],
            jump:[80,81],
            land:{frames:[81,80]},
            land_skate_stand:{frames:[80,81,48,49,50,51,52,53,54,55,56,57,32]}
        }
    },
    m_SkaterRect: null,
	m_SkaterSprite: null,
	m_SkaterSpriteIsAnimating: false,
    m_SkaterDistanceToCursor: 0,
	m_SkaterSpriteYMove: 0,
	m_SkaterSpriteXMove: 0,
	m_SkaterSpriteLastY: 0,
	m_SkaterSpriteLastX: 0,
    m_SkaterStartJump: false,
    m_SkaterBoostJump: false,
    m_SkaterBoostsRemaining: g_SkaterBoostMax,
    m_SkaterOnIce: false,
    m_SkaterIsUp: true
};

function SkaterAnimate(
    msg,
    skater,
    seconds,
    state,
    label,
    onEnd)
{
    /*
    if(msg)
    {
        zog("SkaterAnimate from " + g_YuriKatsuki.m_SkaterLocation + ": " + msg);
    }
    */
   
    skater.m_SkaterState = state;
    skater.m_SkaterSprite.pauseRun(false);
    skater.m_SkaterSprite.run(seconds, label, onEnd);
    skater.m_SkaterIsAnimating = true;
}
