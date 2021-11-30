
/** scale all sprites by this value
*/
const g_GlobalScale = 2;

/** the zim frame requires this data is provided
 *  at the time it is created
*/
const g_FrameSettings =
{
	m_FrameAssets: null,
	m_FrameAssetsPath: "",
	m_FrameScaling:"fit",
	m_FrameWidth:1800,
	m_FrameHeight:500,
	m_FrameColor:"#AAAAFF",
	m_FrameOuterColor:"#AAAAFF"
};

/** margin around the frame where physics will take place
*/
const g_PhysicsMargin = 
{
	left:10,
	right:10,
	top:5,
	bottom:20
};

/** settings for the physics world
*/
const g_PhysicsSettings =
{
	gravity: 10,
	borders:
	{
		x:g_PhysicsMargin.left,
		y:g_PhysicsMargin.top,
		width: g_FrameSettings.m_FrameWidth - g_PhysicsMargin.left - g_PhysicsMargin.right,
		height: g_FrameSettings.m_FrameHeight - g_PhysicsMargin.top - g_PhysicsMargin.bottom
	}
};

/** colors for the ice to skake on
*/
const IceColor_e = 
{
	LIGHTEST: convertColor("rgb(200,250,251)"),
	LIGHT: convertColor("rgb(150,250,251)"),
	DARK: convertColor("rgb(100,250,251)")
};
