import { Application, Assets, Container, Sprite, Text, Texture, RenderLayer } from "pixi.js";

const app = new Application();
(globalThis as any).__PIXI_APP__ = app;

(async () => {

  ////////////////////
  // INITIALIZATION //
  ////////////////////

  // important variables
  let speedMult: number = 1; // Not actually that important right now. Unused.
  const defaultVelocity: { x: number; y: number } = { x: -15 * speedMult, y: (Math.floor(Math.random() * 10) - 5) };
  let score: number = 0;
  let gameStarted: boolean = false;

  const localStorage = window.localStorage;
  const highScore: string = localStorage.getItem("highScore") || "0";

  // Initialize new application
  // npx vite
  
  await app.init({ background: "#0a0a0a", resizeTo: window, antialias: true });
  app.stage.interactive = true;
  document.getElementById("pixi-container")!.appendChild(app.canvas);
  console.log("app initialized");

  let appLayer = new RenderLayer();
  let backgroundLayer = new RenderLayer();

  console.log("layers initialized");
  
  ///////////////////
  // ASSET LOADING //
  ///////////////////

  // Loading webfonts
  Assets.addBundle("fonts", [
    {
      alias:"Square",
      src: "assets/fonts/Square.ttf"
    },
    {
      alias: "Creatodisplay Thin",
      src: "assets/fonts/CreatoDisplay-Thin.otf"
    },
  ]);

  await Assets.loadBundle("fonts");
  console.log("webfonts loaded");

  // Loading sprite textures
  const redPongTexture = await Assets.load("assets/sprites/redPong.png");
  const ballTexture = await Assets.load("assets/sprites/ball.png");
  console.log("sprite textures loaded");

  /////////////
  // SPRITES //
  /////////////

  // Red Pong Sprite //
  const  redPong: Sprite = Sprite.from(redPongTexture);
  redPong.scale.set(0.15, 0.3);
  redPong.anchor.set(0.5);
  redPong.position.set(10, app.screen.height / 2);
  

  // Ball Sprite //
  const ball: Sprite = Sprite.from(ballTexture);
  ball.scale.set(0.1, .1);
  ball.anchor.set(0.5);
  ball.position.set(app.screen.width / 2, app.screen.height / 2);
  ball.eventMode = "static";
  ball.zIndex = 1;
  
  // Transparent Menu Background Sprite - for start menu events //
  const menuBg = new Sprite(Texture.EMPTY);
  menuBg.width = app.screen.width;
  menuBg.height = app.screen.height;
  menuBg.tint = 0x000000;
  menuBg.visible = true;

  // Adding all sprites to the stage
  app.stage.addChild(redPong);
  app.stage.addChild(ball);
  app.stage.addChild(menuBg);

  ///////////
  // MENUS //
  ///////////

  // Intro Menu Text //
  const menuText = new Text({
    text: "Click to start",
    style: {
      fontFamily: "Creatodisplay Thin",
      fontSize: 42,
      fill: 0xffffff,
      align: "center",
    },
    anchor: { x: 0.5, y: 0.5 },
    position: { x: app.screen.width / 2, y: app.screen.height - 150 }, 
    interactive: true,
  });

  // Restart Menu Text //
  const restartMenuText = new Text({
    text: "hit R to restart",
    style: {
      fontFamily: "Creatodisplay Thin",
      fontSize: 42,
      fill: 0xffffff,
      align: "center",
    },
    anchor: { x: 0.5, y: 0.5 },
    position: { x: app.screen.width / 2, y: app.screen.height - 150 }, 
    interactive: true,
    visible: false
  });

  // Scoreboard Container //
  let scoreboardContainer: Container = new Container();
  scoreboardContainer.interactive = true;
  scoreboardContainer.position.set(app.screen.width / 2, app.screen.height / 8 + 50);
  scoreboardContainer.width = app.screen.width / 4;
  scoreboardContainer.height = app.screen.height / 8;

  // Scoreboard Text //
  const scoreboard = new Text({
    text: score.toString(),
    style: {
      fontFamily: "Square",
      fontSize: 184,
      fill: 0x7a7a7a,
      align: "center",
    },
    anchor: { x: 0.5, y: 0.5 },
    scale: { x: 1.5, y: 1.5 },
    position: { x: scoreboardContainer.width / 2, y: app.screen.height / 50 },
    interactive: true,
  });

  // High Score Text //
  const highScoreText = new Text({
    text: "High Score: " + highScore.toString(),
    style: {
      fontFamily: "creatodisplay Thin",
      fontSize: 26,
      fill: 0xffffff,
      align: "center",
      fontWeight: "bolder",
    },
    anchor: { x: 0.5, y: 0.5 },
    position: { x: app.screen.width / 2, y: app.screen.height - 50 },
    interactive: true,
  });

  // Adding menus to the stage
  app.stage.addChild(menuText);
  app.stage.addChild(restartMenuText);
  app.stage.addChild(highScoreText);
  app.stage.addChild(scoreboardContainer);
  scoreboardContainer.addChild(scoreboard);

  /////////////////////////
  // LAYER CONFIGURATION //
  /////////////////////////

  appLayer.attach(redPong);
  appLayer.attach(ball);
  backgroundLayer.attach(menuBg);
  backgroundLayer.attach(menuText);
  backgroundLayer.attach(restartMenuText);
  backgroundLayer.attach(highScoreText);
  backgroundLayer.attach(scoreboardContainer);

  app.stage.addChildAt(appLayer, 1);
  app.stage.addChildAt(backgroundLayer, 0);

  ////////////////////
  // GAME FUNCTIONS //
  ////////////////////
  
  // Moves redPong to the mouse cursor Y level
  function moveRedPong(e: any) {
    let pos = e.data.global;
    redPong.y = pos.y;
  };

  // Check if redPong is within the bounds of the window
  function checkRedPongBounds() {
    if (redPong.y - redPong.height / 2 <= 0 || redPong.y + redPong.height / 2 >= app.screen.height) {
      redPong.y = Math.max(redPong.height / 2, Math.min(redPong.y, app.screen.height - redPong.height / 2));
    };
  };

  // Increments score and updates scoreboard text
  function scoreIncrement() {
    score++;
    scoreboard.text = score.toString();
  };

  // Checks for high score and updates scoreboard
  function highScoreCheck(score: number) {
    if (score > Number(highScore)) {
      localStorage.setItem("highScore", score.toString());
      highScoreText.text = "High Score: " + score.toString();
    }
  }

  function fadeText(text: Text) {
    while (text.alpha > 0) {};
  }

  ////////////////////////////////
  // MOVEMENT / COLLISION LOGIC //
  ////////////////////////////////

  let initialVelocity: { x: number; y: number } = { x: 0, y: 0 };
  let velocity = initialVelocity;
  velocity.x = defaultVelocity.x;
  velocity.y = defaultVelocity.y;

  // funtion to move the ball
  function moveBall(delta: number) {

    // Initial movement animation listener

    ball.x += velocity.x * delta;
    ball.y += velocity.y * delta;

    if (ball.x + ball.width / 2 < 0) {
      gameStarted = false;
      restartPrompt();
      highScoreCheck(score);
      return;
    };

    // If ball collides with top window border reverse its velocity.y
    if (ball.y - ball.height / 2 <= 0 || ball.y + ball.height / 2 >= app.screen.height) {
      velocity.y *= -1;
    };
    // If ball collides with right window border reverse its velocity.x
    if(ball.x + ball.width / 2 >= app.screen.width) {
      velocity.x *= -1;
    };

    // If ball collides with Paddle
    if (AABBtest(redPong, ball)) {
      
      // Reverse velocity.x
      velocity.x *= -1;
      scoreIncrement();

      //  If ball hits the top or bottom third of the paddle have a 30% chance to ricochet.
      // Haven't quite figured out how to implement the full pong logic into Pixi yet.
      // Maybe using geometrical vectors to calculate the angle of the bounce, replacing sprites.
      const ricochetChance = Math.floor(Math.random() * 10) + 1;

      if (ball.y < redPong.y - redPong.height / 3 ||
          ball.y > redPong.y + redPong.height / 3 ) {

            if(ricochetChance > 3) {
              const angleChange: number = Math.floor(Math.random() * 10) 
              velocity.y += angleChange;
            }

            if (ricochetChance <= 3) {
              velocity.y *= -1;
            }
      }
    }
  };

  // Run AABBtest function to check for collision between two sprites
  function AABBtest(object1: Sprite, object2: Sprite) {
    const object1Bounds = object1.getBounds();
    const object2Bounds = object2.getBounds();

    return (
      object1Bounds.x < object2Bounds.x + object2Bounds.width &&
      object1Bounds.x + object1Bounds.width > object2Bounds.x &&
      object1Bounds.y < object2Bounds.y + object2Bounds.height &&
      object1Bounds.y + object1Bounds.height > object2Bounds.y
    );
  };

  // removes menus and click event listeners, also sets default ball speed
  function startGame() {
    gameStarted = true;
    menuBg.visible = false;
    menuText.visible = false;
    velocity.x = defaultVelocity.x;
    velocity.y = defaultVelocity.y;
    gameLoop();
    app.stage.off("click", startGame);
  };

  // Restart Game
  function restartGame() {
    restartMenuText.visible = false;
    ball.x = app.screen.width / 2;
    ball.y = app.screen.height / 2;
    menuBg.visible = true;
    menuText.visible = true;
    score = 0;
    scoreboard.text = score.toString();
    
    app.stage.on("click", resetGame);
  };

  // Listens for a keypress to restart the game, removes event listener
  function restartHandler(e: any) {
    if (e.key === "r") {
      restartGame();
      document.removeEventListener("keydown", restartHandler);
    };
  };
  
  // Restart text and event listener
  function restartPrompt() {
    restartMenuText.visible = true;
    document.addEventListener("keydown", restartHandler);
  };

  // Resets game state after restart
  // Resets ball position and velocity
  function resetGame() {
    gameStarted = true;
    menuBg.visible = false;
    menuText.visible = false;

    velocity.x = defaultVelocity.x;
    velocity.y = defaultVelocity.y;
    app.stage.off("click", resetGame);
  };

  ///////////////
  // GAME LOOP //
  ///////////////

  // Click to start

  app.stage.on("click", startGame);
  
  function gameLoop() {
    app.ticker.add((time) => {
      const delta: number = time.deltaTime;

      // This entire if/else structure might be entirely useless
      // Will test in a future Branch

      if (gameStarted) {
        moveBall(delta);
        app.stage.on("globalpointermove", moveRedPong);
        checkRedPongBounds();
      }

      else {
        velocity.x = 0;
        velocity.y = 0;
      }

    });
  }

})();
