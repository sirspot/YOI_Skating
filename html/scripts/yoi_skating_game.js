
// assign the assets path
g_FrameSettings.m_FrameAssetsPath = "assets/";
// create an array of assets to preload
// from the assets path
let assetsPathPng = "png/";
let assetsPathMp3 = "mp3/";
g_FrameSettings.m_FrameAssets =
[
	assetsPathPng + "yoi_skating_bg.png",
	assetsPathPng + "yoi_skating_fg.png",
	assetsPathPng + "yoi_skating_bowl_soup.png",
	assetsPathPng + "yoi_skating_spritesheet_makkachin.png",
	assetsPathPng + g_YuriKatsuki.m_SkaterAssetFilename,
	{id:"floor",   maxNum:1, src: assetsPathMp3 + "yoi_skating_music_floor.mp3"},
	{id:"music",   maxNum:1, src: assetsPathMp3 + "yoi_skating_music_ice_rink.mp3"},
	{id:"cheer",   maxNum:1, src: assetsPathMp3 + "yoi_skating_cheers_basic.mp3"},
	{id:"cheers",  maxNum:1, src: assetsPathMp3 + "yoi_skating_cheers_minor.mp3"},
	{id:"cheers!", maxNum:1, src: assetsPathMp3 + "yoi_skating_cheers_major.mp3"},
	{id:"start",   maxNum:1, src: assetsPathMp3 + "yoi_skating_skates_start.mp3"},
	{id:"stop",    maxNum:1, src: assetsPathMp3 + "yoi_skating_skates_stop.mp3"},
	{id:"spin",    maxNum:1, src: assetsPathMp3 + "yoi_skating_skates_spin.mp3"},
];

// create a preload waiter
// this will be shown while the frame loads all assets
const g_ZimWaiter = new Waiter();

// create the frame for this project.
// see g_ZimFrame.on("ready"
// for the next part of the loading process
const g_ZimFrame = new Frame(g_FrameSettings.m_FrameScaling, 
							g_FrameSettings.m_FrameWidth,
							g_FrameSettings.m_FrameHeight,
							g_FrameSettings.m_FrameColor,
							g_FrameSettings.m_FrameOuterColor,
					  		g_FrameSettings.m_FrameAssets,
							g_FrameSettings.m_FrameAssetsPath,
					  		g_ZimWaiter);

// these will be updated when the frame is ready
// see g_ZimFrame.on("ready"
let g_ZimStage = null;
let g_ZimGridManager = null;
let g_ZimPhysics = null;
let g_RectEntry = null;
let g_RectFloor = null;
let g_RectFloorTop = 0;
let g_MouseButtonDown = false;
let g_MouseButtonDownCount = -1;
let g_IceRinkMusic = null;
let g_FloorMusic = null;
let g_FirstTransition = true;
let g_Score = null;
let g_Hangtime = 0;
let g_ShowInstructionsTime = 0;
const g_RinkEntryPosition = 600;

let g_Makkachin = null;

function SkaterMusicPlay()
{
	if(g_MouseButtonDownCount >= 0)
	{
		// mouse has been pressed at least once
		if((g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_ICE) ||
		   (g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_AIR))
		{
			// music on ice
			if(g_IceRinkMusic == null)
			{
				g_IceRinkMusic = asset("music").play({volume:.04, loop:true, interrupt:"none"});
			}
			if(g_FloorMusic != null)
			{
				if(g_Makkachin.m_DogSprite)
				{
					g_Makkachin.m_DogSprite.run({time:.5, label:"idle", loop:false});
					if(g_Makkachin.m_DogHasJumpedIn)
					{
						// Makkachin jumps away
						g_Makkachin.m_DogSprite.impulse(-80,-150);
						g_Makkachin.m_DogHasJumpedIn = false;
					}
				}
				g_FloorMusic.stop();
				g_FloorMusic = null;
			}
		}
		else
		{
			// music on ground
			if(g_FloorMusic == null)
			{
				g_FloorMusic = asset("floor").play({volume:.04, loop:true, interrupt:"none"});
			}			
			if(g_IceRinkMusic != null)
			{
				g_Makkachin.m_DogSprite.run({time:.5, label:"wag", loop:true});
				if(g_Makkachin.m_DogHasJumpedIn == false)
				{
					// first time stepping off the ice.
					// bring in Makkachin
					g_Makkachin.m_DogSprite.impulse(80,-150);
					g_Makkachin.m_DogHasJumpedIn = true;
				}
				else
				{
					g_Makkachin.m_DogSprite.impulse(0,-80);
				}
				g_IceRinkMusic.stop();
				g_IceRinkMusic = null;
			}
		}
	}
}

/** when the skater animation is done this
    function will set the new state
*/
function SkaterAnimationDone()
{
	g_YuriKatsuki.m_SkaterIsAnimating = false;
	
	if(g_YuriKatsuki.m_SkaterState == SkaterState_e.LANDING)
	{
		//
		// DONE LANDING
		//
		g_YuriKatsuki.m_SkaterState = SkaterState_e.LANDED;
		if(g_YuriKatsuki.m_SkaterLocation != SkaterLocation_e.GROUND)
		{
			// done landing onto the ice
			g_RectFloor.color = IceColor_e.LIGHT;
			if(g_YuriKatsuki.m_SkaterBoostsRemaining == 0)
			{
				if(g_YuriKatsuki.m_SkaterIsUp)
				{
					asset("cheers!").play({volume:.15, interrupt:"none"});

					//
					// PORK CUTLET BOWL
					//
					let porkCutletBowl = asset(assetsPathPng + "yoi_skating_bowl_soup.png").clone().addTo().centerReg();
					porkCutletBowl.addTo().top().ord(-2);
					porkCutletBowl.centerReg();
					porkCutletBowl.sca(.3);
					let bowlMargin = (porkCutletBowl.width*porkCutletBowl.scaleX)*8;
					let bowlXPos = g_YuriKatsuki.m_SkaterRect.x + bowlMargin;
					if(bowlXPos > (g_RectFloor.width - bowlMargin))
					{
						bowlXPos = (g_YuriKatsuki.m_SkaterRect.x - bowlMargin);
					}
					if(bowlXPos < (g_RinkEntryPosition + bowlMargin))
					{
						bowlXPos = (g_RinkEntryPosition + bowlMargin);
					}
					let bowlYPos = (g_RectFloorTop - (porkCutletBowl.height*porkCutletBowl.scaleY));
					porkCutletBowl.pos(
						bowlXPos, 
						bowlYPos);
					porkCutletBowl.addPhysics(
							{
								friction:.8,
								bounciness:.4,
								maskBits:1|2,
								categoryBits:1
							}
						);
					porkCutletBowl.contact(
						function (obj, body)
						{
							if(obj == g_YuriKatsuki.m_SkaterRect)
							{
								porkCutletBowl.impulse(g_YuriKatsuki.m_SkaterSpriteXMove,-5);
							}
						}
					);
					porkCutletBowl.impulse(0,-11);
					ShowScore("Incredible Jump\nEnjoy your Pork Cutlet Bowl!", 8, true);

				}
				else
				{
					// fell down on the ice
					ShowScore("Ouch, that HURT!", 1, true);
				}
			}
			else if(g_YuriKatsuki.m_SkaterIsUp)
			{
				if(g_Hangtime > 1)
				{
					ShowScore("Nice Landing", 1, true);
				}
			}
			else
			{
				// fell down on the ice
			}
		}
		else
		{
			// done landing onto the ground
			g_RectFloor.color = convertColor("rgb(175,175,175)"); 
			g_YuriKatsuki.m_SkaterRect.body.GetFixtureList().SetFriction(.02);
			if(g_YuriKatsuki.m_SkaterIsUp)
			{
				asset("cheer").play({volume:.15, interrupt:"none"});
			}
			else
			{
				// fell down on the ground
			}
		}
	}
	else if(g_YuriKatsuki.m_SkaterState == SkaterState_e.JUMPING)
	{
		//
		// DONE JUMPING
		//
		g_YuriKatsuki.m_SkaterState = SkaterState_e.JUMPED;
		g_RectFloor.color = IceColor_e.LIGHTEST;
		asset("cheers").play({volume:.1, interrupt:"none"});
	}
	else if(g_YuriKatsuki.m_SkaterState == SkaterState_e.IDLE)
	{
		//
		// DONE GOING IDLE
		//
		if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.GROUND)
		{
			// became idle on the ground
			g_RectFloor.color = convertColor("rgb(175,175,175)"); 
			g_YuriKatsuki.m_SkaterRect.body.GetFixtureList().SetFriction(.02);
		}
	}
}

/** called when the frame is resized.
    \todo does this need to change the g_ZimPhysics world as well?
*/
g_ZimFrame.on("resize",
	function()
	{
		if(g_ZimGridManager)
		{
			g_ZimGridManager.resize();
		}
	}
);

/** called when the frame is ready for items
    to be added to the stage
*/
g_ZimFrame.on("ready",
	function()
	{
		g_ZimStage = g_ZimFrame.stage;

		// add a grid manager with pixel accurate grid
		g_ZimGridManager = new GridManager();
		// AR - uncomment this to show a pixel grid
		//g_ZimGridManager.add(new Grid({percent:false}));

		// create the physics world before adding items to it
		g_ZimPhysics = new Physics(g_PhysicsSettings);
		g_ZimPhysics.remove(g_ZimPhysics.borderTop);

		//
		// FLOOR
		//
		g_RectFloor = new Rectangle(g_FrameSettings.m_FrameWidth, g_PhysicsMargin.bottom)
						.centerReg()
						.pos(0, g_FrameSettings.m_FrameHeight-(g_PhysicsMargin.bottom))
						.addPhysics(false);
		g_RectFloorTop = g_RectFloor.y - (g_RectFloor.height/2);
		g_RectFloor.color = IceColor_e.LIGHT;

		//
		// RINK ENTRY
		//
		g_RectEntry = new Rectangle(10, g_FrameSettings.m_FrameHeight-g_PhysicsMargin.bottom)
						.centerReg()
						.pos(g_PhysicsMargin.right + g_RinkEntryPosition, 0)
						.addPhysics({categoryBits:2,dynamic:false});
		g_RectEntry.color = "rgba(175,175,175,.01)";

		//
		// SCORE
		//
		const rinkWidth = g_FrameSettings.m_FrameWidth - (g_RectEntry.x + g_RectEntry.width);
		g_Score = ShowScore("Click to the left or right\nof Yuri to begin moving.", g_ShowInstructionsTime);
		g_Score.addTo();
		g_Score.pos(g_RinkEntryPosition + 20, 20);

		//
		// SPOTLIGHT
		//
		let spotLight = ShowSpotLight();
		spotLight.addTo().pos(g_ZimStage.width - 200, -100);

		//
		// YURI KATSUKI
		//
		// create skater and add to the stage
		g_YuriKatsuki.m_SkaterRect = new Rectangle(24,64);
		g_YuriKatsuki.m_SkaterRect.color = "rgba(0,255,0,0)";
		g_YuriKatsuki.m_SkaterRect.sca(g_GlobalScale);
		g_YuriKatsuki.m_SkaterRect.centerReg();
		g_YuriKatsuki.m_SkaterRect.addTo();

		g_YuriKatsuki.m_SkaterAsset = asset(assetsPathPng + g_YuriKatsuki.m_SkaterAssetFilename);
		g_YuriKatsuki.m_SkaterSpriteSettings.image = g_YuriKatsuki.m_SkaterAsset;
		g_YuriKatsuki.m_SkaterSprite = new Sprite(g_YuriKatsuki.m_SkaterSpriteSettings);
		g_YuriKatsuki.m_SkaterSprite.centerReg();
		g_YuriKatsuki.m_SkaterSprite.pos(-20,0);
		g_YuriKatsuki.m_SkaterRect.addChild(g_YuriKatsuki.m_SkaterSprite);

		//
		// MAKKACHIN
		//
		g_Makkachin = 
		{
			m_DogAsset:null,
			m_DogSprite:null,
			m_DogSpriteSettings:null,
			m_DogFloor:null,
			m_DogHasJumpedIn:false
		};

		g_Makkachin.m_DogAsset = asset(assetsPathPng + "yoi_skating_spritesheet_makkachin.png");
		g_Makkachin.m_DogSpriteSettings = 
		{
			image:g_Makkachin.m_DogAsset,
			cols:5,
			rows:1,
			animations:
			{
				idle:[0,0],
				wag:[0,4]
			}
		};
		g_Makkachin.m_DogSprite = new Sprite(g_Makkachin.m_DogSpriteSettings);
		g_Makkachin.m_DogSprite.sca(g_GlobalScale);
		g_Makkachin.m_DogSprite.centerReg();

		g_Makkachin.m_DogFloor = new Rectangle(g_FrameSettings.m_FrameWidth+(g_Makkachin.m_DogSprite.width*g_GlobalScale),5);
		g_Makkachin.m_DogFloor.centerReg();
		g_Makkachin.m_DogFloor.addTo();
		g_Makkachin.m_DogFloor.pos(0-(g_Makkachin.m_DogSprite.width*g_GlobalScale),g_FrameSettings.m_FrameHeight-g_PhysicsMargin.bottom+10);
		g_Makkachin.m_DogFloor.addPhysics(
			{
				maskBits:4,
				categoryBits:4,
				dynamic: false
			}
		);

		g_Makkachin.m_DogSprite.addTo();
		g_Makkachin.m_DogSprite.pos(0-g_Makkachin.m_DogSprite.width,g_FrameSettings.m_FrameHeight-g_PhysicsMargin.bottom+10-g_Makkachin.m_DogSprite.height);
		g_Makkachin.m_DogSprite.run({time:.5, label:"idle", loop:false});
		g_Makkachin.m_DogSprite.addPhysics(
			{
				friction:.2,
				bounciness:.4,
				maskBits:4,
				categoryBits:4,
			}
		);

		//
		// BACKGROUND AND FOREGROUND
		//
		let bgImg = asset(assetsPathPng + "yoi_skating_bg.png").addTo().bot();
		let fgImg = asset(assetsPathPng + "yoi_skating_fg.png").addTo().top().alp(.4).pos(0,-20);

		// calculate the size of skater on the stage
		g_YuriKatsuki.m_SkaterWidth = (g_YuriKatsuki.m_SkaterSprite.width * g_YuriKatsuki.m_SkaterSprite.scaleX);
		g_YuriKatsuki.m_SkaterHeight = (g_YuriKatsuki.m_SkaterSprite.height * g_YuriKatsuki.m_SkaterSprite.scaleY);
		g_YuriKatsuki.m_SkaterRect.x = g_YuriKatsuki.m_SkaterWidth*2;
		g_YuriKatsuki.m_SkaterOnIce = false;
		g_YuriKatsuki.m_SkaterRect.y = (g_FrameSettings.m_FrameHeight - g_YuriKatsuki.m_SkaterHeight) - 20;
		// add to the physics world and set the function
		// to handle contact with the physics body
		g_YuriKatsuki.m_SkaterRect.addPhysics(g_YuriKatsuki.m_SkaterSpritePhysicsSettings);
		g_YuriKatsuki.m_SkaterRect.contact(
			function (obj, body)
			{
				if (obj == g_RectFloor)
				{
					g_RectFloor.color = IceColor_e.DARK;

					let overIce = false;
					if(g_YuriKatsuki.m_SkaterRect.x > g_RectEntry.x)
					{
						overIce = true;
					}

					if(overIce)
					{
						if(g_YuriKatsuki.m_SkaterIsUp)
						{
							if(g_YuriKatsuki.m_SkaterLocation != SkaterLocation_e.RINK_ICE)
							{
								// skater hit the ice after last known location not over ice.
								// start landing immediately
								g_YuriKatsuki.m_SkaterLocation = SkaterLocation_e.RINK_ICE;
								g_YuriKatsuki.m_SkaterRect.body.GetFixtureList().SetFriction(0);
								SkaterAnimate("landing", g_YuriKatsuki, .2, SkaterState_e.LANDING, "land", SkaterAnimationDone);
							}
							else
							{
								// skater hit the ice while already on the ice
							}
						}
						else
						{
							// fell down on the ice
							ShowScore("Oh no!", 4, true);
						}
					}
					else
					{
						if(g_YuriKatsuki.m_SkaterIsUp)
						{
							if(g_MouseButtonDownCount >= 0)
							{
								ShowScore("Jumped out of the rink!",2);
							}
							if(g_YuriKatsuki.m_SkaterLocation != SkaterLocation_e.GROUND)
							{
								// skater hit the ground after last known location not on the ground.
								// start landing immediately
								g_YuriKatsuki.m_SkaterLocation = SkaterLocation_e.GROUND;
								SkaterAnimate("landing", g_YuriKatsuki, .2, SkaterState_e.LANDING, "bend", SkaterAnimationDone);
								SpotLightOff();
							}
							else
							{
								// skater hit the ground while already on the ground
							}
						}
						else
						{
							// fell down on the ground
							ShowScore("Ooooff", 4, true);
						}
					}
				}
			}
		);

		//
		// GAME LOGIC
		//
		// called in a tight loop, this handles application
		// of forces to the skater and which animations to use 
		//
		Ticker.add(
			function()
			{
				let yPush = 0;
				let xPush = 0;

				// determine the distance from the skater to the mouse cursor
				g_YuriKatsuki.m_SkaterDistanceToCursor = (g_ZimFrame.mouseX - g_YuriKatsuki.m_SkaterRect.x);

				// calculate skater X position movement
				g_YuriKatsuki.m_SkaterSpriteXMove = (g_YuriKatsuki.m_SkaterRect.x - g_YuriKatsuki.m_SkaterSpriteLastX);
				g_YuriKatsuki.m_SkaterSpriteLastX = g_YuriKatsuki.m_SkaterRect.x;

				// calculate skater Y position movement
				g_YuriKatsuki.m_SkaterSpriteYMove = (g_YuriKatsuki.m_SkaterRect.y - g_YuriKatsuki.m_SkaterSpriteLastY);
				g_YuriKatsuki.m_SkaterSpriteLastY = g_YuriKatsuki.m_SkaterRect.y;

				// determine if skater is standing up
				const offAxisMin = 15;
				const offAxisMax = (360 - offAxisMin);
				let offAxis = (Math.abs(g_YuriKatsuki.m_SkaterRect.rotation) % 360);
				if((offAxis >= offAxisMin) && (offAxis <= offAxisMax))
				{
					g_YuriKatsuki.m_SkaterIsUp = false;
					SetJumpPower(0);
					SpotLightOff();
				}
				else
				{
					g_YuriKatsuki.m_SkaterIsUp = true;
				}

				// determine skater relative location
				let onIce = false;
				if(g_YuriKatsuki.m_SkaterRect.x > g_RectEntry.x)
				{
					onIce = true;
					if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_ICE)
					{
						if(g_YuriKatsuki.m_SkaterIsUp)
						{
							SpotLightOn();
							MoveSpotLight(g_YuriKatsuki.m_SkaterRect.x);
						}
					}
				}
				if(onIce != g_YuriKatsuki.m_SkaterOnIce || g_FirstTransition)
				{
					//
					// SKATER MOVED FROM ICE TO GROUND OR VICE-VERSA
					//
					SetJumpPower(0);
					if(g_YuriKatsuki.m_SkaterLocation != SkaterLocation_e.RINK_AIR)
					{
						if(onIce)
						{
							if(g_YuriKatsuki.m_SkaterLocation != SkaterLocation_e.RINK_ICE)
							{
								// skater location is now on the ice
								g_YuriKatsuki.m_SkaterLocation = SkaterLocation_e.RINK_ICE;
								g_RectFloor.color = IceColor_e.LIGHT;
								g_YuriKatsuki.m_SkaterRect.body.GetFixtureList().SetFriction(0);
								SkaterAnimate("standing", g_YuriKatsuki, .1, SkaterState_e.STANDING, "stand", SkaterAnimationDone);
								ShowScore("Skate to gain power and\nclick while skating to jump",g_ShowInstructionsTime);
								g_ShowInstructionsTime = 5;
							}
							else
							{
								// skater already on the ice
							}
						}
						else
						{
							if(g_YuriKatsuki.m_SkaterLocation != SkaterLocation_e.GROUND)
							{
								// skater location is now on the ground
								g_YuriKatsuki.m_SkaterLocation = SkaterLocation_e.GROUND;
								g_YuriKatsuki.m_SkaterRect.body.GetFixtureList().SetFriction(.02);
								SkaterAnimate("idle", g_YuriKatsuki, .1, SkaterState_e.IDLE, "idle", SkaterAnimationDone);
								asset("cheer").play({volume:.1, interrupt:"none"});
								if(g_MouseButtonDownCount >= 0)
								{
									ShowScore("Nice job!", 4, true);
								}
								SpotLightOff();
							}
							else
							{
								// skater already on the ground
							}
						}
						g_YuriKatsuki.m_SkaterOnIce = onIce;
					}
					else
					{
						// skater is in the air still
					}

					SkaterMusicPlay();
					g_FirstTransition = false;
				}

				if(g_YuriKatsuki.m_SkaterStartJump)
				{
					//
					// START JUMP
					//
					g_YuriKatsuki.m_SkaterStartJump = false;
					g_YuriKatsuki.m_SkaterBoostsRemaining = g_SkaterBoostMax;
					if(g_YuriKatsuki.m_SkaterState == SkaterState_e.SKATING)
					{
						g_YuriKatsuki.m_SkaterLocation = SkaterLocation_e.RINK_AIR;
						SkaterAnimate("jump", g_YuriKatsuki, .15, SkaterState_e.JUMPING, "jump", SkaterAnimationDone);
						asset("spin").play({volume:.05, interrupt:"any"});
						yPush = (-65 * Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleY));
					}
					else
					{
						// not skating yet
					}
				}
				else
				{
					// not time to start a jump
				}

				if(g_YuriKatsuki.m_SkaterBoostJump)
				{
					g_YuriKatsuki.m_SkaterBoostJump = false;
					if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_AIR)
					{
						if(Math.abs(g_YuriKatsuki.m_SkaterSpriteXMove) >= 3)
						{
							//
							// JUMP BOOST
							//
							yPush = (-65 * Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleY));
							xPush = (20 * Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleX));
							g_YuriKatsuki.m_SkaterBoostsRemaining = g_YuriKatsuki.m_SkaterBoostsRemaining - 1;
							if(g_YuriKatsuki.m_SkaterBoostsRemaining > 0)
							{
								if(g_YuriKatsuki.m_SkaterBoostsRemaining == 1)
								{
									ShowScore("Yes!", 2, true);
								}
								else
								{
									ShowScore("Amazing!", 2, true);
								}
							}
						}
						else
						{
							// not moving fast enough for a boost
						}
					}
					else
					{
						// skater must be in the air
					}
				}
				
				if(g_MouseButtonDown)
				{
					if(xPush == 0)
					{
						// when the mouse button is down
						// the default is to keep pushing the skater.
						if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.GROUND)
						{
							// slower on the ground
							xPush = (1.3 * Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleX));
						}
						else
						{
							// faster on ice and in the air
							xPush = (2 * Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleX));
						}
					}
				}
				else
				{
					// no mouse button
				}

				// determine which direction for the skater to face
				if(g_YuriKatsuki.m_SkaterDistanceToCursor > 0)
				{
					// facing to the left
					xPush = xPush * -1;
					g_YuriKatsuki.m_SkaterSprite.scaleX = Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleX) * -1;
				}
				else
				{
					// facing to the right
					g_YuriKatsuki.m_SkaterSprite.scaleX = Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleX);
				}

				if(g_YuriKatsuki.m_SkaterIsUp)
				{
					if(yPush != 0)
					{
						if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_AIR)
						{
							if(HasJumpPower() == false)
							{
								yPush = (-15 * Math.abs(g_YuriKatsuki.m_SkaterSprite.scaleY));
							}
							//zog("yPush = " + yPush + " and xPush = " + xPush);
							g_YuriKatsuki.m_SkaterRect.impulse(xPush, yPush);
							DecreaseJumpPower();
						}
					}
					else if(xPush != 0)
					{
						if(g_YuriKatsuki.m_SkaterLocation != SkaterLocation_e.RINK_AIR)
						{
							//zog("xPush = " + xPush);
							g_YuriKatsuki.m_SkaterRect.impulse(xPush, 0);
						}
					}
				}
				else
				{
					// skater can't jump or skate or walk when not up
				}

				if(g_YuriKatsuki.m_SkaterIsAnimating == false)
				{
					if(g_YuriKatsuki.m_SkaterIsUp == false)
					{
						if(g_YuriKatsuki.m_SkaterState != SkaterState_e.IDLE)
						{
							// go idle
							SkaterAnimate("idle", g_YuriKatsuki, .1, SkaterState_e.IDLE, "idle", SkaterAnimationDone);
						}
					}
					else if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_AIR)
					{
						// skater is in the air
						let yuriKatsukiSpriteAnkleHeight = 10;
						let yuriKatsukiSpriteAnklePos = g_YuriKatsuki.m_SkaterRect.y - yuriKatsukiSpriteAnkleHeight;
						let yuriKatsukiSpriteMinAnklePos = g_RectFloorTop - yuriKatsukiSpriteAnkleHeight;
						if(g_YuriKatsuki.m_SkaterSpriteYMove > 0)
						{
							// skater is falling
							if(yuriKatsukiSpriteAnklePos < yuriKatsukiSpriteMinAnklePos)
							{
								// keep spinning when above ankle height
								SkaterAnimate("falling spin", g_YuriKatsuki, .45, SkaterState_e.SPINNING, "spin", SkaterAnimationDone);
								g_Hangtime = g_Hangtime + 1;
								SpotLightOff();
							}
							else
							{
								// getting close to the ground so don't try to animate
							}
						}
						else
						{
							// skater is rising
							// start spinning immediately
							SkaterAnimate("rising spin", g_YuriKatsuki, .45, SkaterState_e.SPINNING, "spin", SkaterAnimationDone);
							g_Hangtime = g_Hangtime + 1;
							SpotLightOff();
						}
					}
					else
					{
						// skater is not in the air
						g_Hangtime = 0;
						if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_ICE)
						{
							// skater is on the ice
							let speedCheck = 1;
							if(g_YuriKatsuki.m_SkaterState == SkaterState_e.STANDING)
							{
								speedCheck = 2;
							}

							if(Math.abs(g_YuriKatsuki.m_SkaterSpriteXMove) >= speedCheck)
							{
								// skating
								SkaterAnimate("skating", g_YuriKatsuki, .6, SkaterState_e.SKATING, "skate", SkaterAnimationDone);
								IncreaseJumpPower();
								asset("start").play({volume:.03, interrupt:"any"});
								if(g_IceRinkMusic)
								{
									g_IceRinkMusic.volume = .04;
									g_IceRinkMusic.paused = false;
								}
							}
							else if(g_YuriKatsuki.m_SkaterState != SkaterState_e.STANDING)
							{
								// done skating
								SkaterAnimate("standing", g_YuriKatsuki, .1, SkaterState_e.STANDING, "stand", SkaterAnimationDone);
								if(g_IceRinkMusic)
								{
									g_IceRinkMusic.volume = .03;
								}
								
							}
							else
							{
								if(Math.abs(g_YuriKatsuki.m_SkaterSpriteXMove) == 0)
								{
									if(g_IceRinkMusic)
									{
										g_IceRinkMusic.volume = .02;
									}
								}
							}
						}
						else if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.GROUND)
						{
							// skater is on the ground

							let speedCheck = .1;
							if(g_YuriKatsuki.m_SkaterState == SkaterState_e.IDLE)
							{
								speedCheck = 2;
							}

							if(Math.abs(g_YuriKatsuki.m_SkaterSpriteXMove) >= speedCheck)
							{
								// walking
								SkaterAnimate("walking", g_YuriKatsuki, 1.4, SkaterState_e.WALKING, "walk", SkaterAnimationDone);
							}
							else if(g_YuriKatsuki.m_SkaterState != SkaterState_e.IDLE)
							{
								// done walking
								SkaterAnimate("idle", g_YuriKatsuki, .1, SkaterState_e.IDLE, "idle", SkaterAnimationDone);
							}
						}
						else
						{
							// skater location is unknown
						}
					}
				}
				else
				{
					// skater is already animating
					// only stop if the skater has stopped while walking
					if(g_YuriKatsuki.m_SkaterState == SkaterState_e.WALKING)
					{
						if(Math.abs(g_YuriKatsuki.m_SkaterSpriteXMove) < 2)
						{
							let walkFrame = (g_YuriKatsuki.m_SkaterSprite.frame - 16);
							if(walkFrame == 3  ||
							   walkFrame == 6  ||
							   walkFrame == 11 ||
							   walkFrame == 13)
							{
								SkaterAnimate("idle", g_YuriKatsuki, .1, SkaterState_e.IDLE, "idle", SkaterAnimationDone);
							}
						}
					}
				}
			}
		);

		/** called when the mouse button is pressed
		*/
		g_ZimStage.on("stagemousedown",
			function(e) 
			{
				g_MouseButtonDown = true;
				if(g_MouseButtonDownCount == -1)
				{
					// first time pressing the mouse
					g_MouseButtonDownCount = 0;
					g_FirstTransition = true;
				}
				g_MouseButtonDownCount = g_MouseButtonDownCount + 1;

				if(g_YuriKatsuki.m_SkaterIsUp == false)
				{
					g_YuriKatsuki.m_SkaterRect.impulse(0,-70);
					timeout(.1, function()
						{
							let spinPower = 7;
							if(g_YuriKatsuki.m_SkaterSprite.scaleX > 0)
							{
								spinPower = -7
							}
							g_YuriKatsuki.m_SkaterRect.spin(spinPower);
						}
					);					
				}

				if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_ICE)
				{
					// the skater is on the ice.

					// tell the skater it is time to jump.
					// see GAME LOGIC for details on whether
					// the skater is actually able to do so.
					g_YuriKatsuki.m_SkaterStartJump = true;
				}
				else
				{
					// the skater is not on the ice.
					if(g_YuriKatsuki.m_SkaterLocation == SkaterLocation_e.RINK_AIR)
					{
						// skater is in the air.
						// check if any jump boosts remain before
						// telling the skater it is time to boost
						if(g_YuriKatsuki.m_SkaterBoostsRemaining > 0)
						{
							g_YuriKatsuki.m_SkaterBoostJump = true;
						}
					}
					else
					{
						// skater must be in the air to get a boost
					}
				}
			}
		);

		/** called when the mouse button is released
		*/
		g_ZimStage.on("stagemouseup",
			function(e) 
			{
				g_MouseButtonDown = false;
			}
		);

		g_ZimStage.update();
	}
);
