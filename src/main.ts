import { Application, Assets, Sprite, Text, Texture } from "pixi.js";

const app = new Application();
(globalThis as any).__PIXI_APP__ = app;

(async () => {

  // INITIALIZATION //

  // important variables
  let speedMult: number = 1;
  let velocity: { x: number; y: number } = { x: -12 * speedMult, y: (Math.floor(Math.random() * 10) - 5) * speedMult };
  let score: number = 0;

  // Initialize new application
  // npx vite
  await app.init({ background: "#0a0a0a", resizeTo: window, antialias: true });
  app.stage.interactive = true;
  document.getElementById("pixi-container")!.appendChild(app.canvas);
  
  // Wait for the texture assets to load
  const redPongTexture = await Assets.load("assets/sprites/redPong.png");
  const ballTexture = await Assets.load("assets/sprites/ball.png");

  // SPRITES //

  // Red Pong Sprite //
  const  redPong: Sprite = Sprite.from(redPongTexture);
  redPong.scale.set(0.15, 0.3);
  redPong.anchor.set(0.5);
  redPong.position.set(10, app.screen.height / 2);
  app.stage.addChild(redPong);

  app.stage.on("globalpointermove", await moveRedPong);

  // Ball Sprite //
  const ball: Sprite = Sprite.from(ballTexture);
  ball.scale.set(0.1, .1);
  ball.anchor.set(0.5);
  ball.position.set(app.screen.width / 2, app.screen.height / 2);
  ball.eventMode = "static";
  
  app.stage.addChild(ball);
  
  // Transparent Menu Background Sprite - for start menu events //
  const menuBg = new Sprite(Texture.EMPTY);
  menuBg.width = app.screen.width;
  menuBg.height = app.screen.height;
  menuBg.tint = 0x000000;
  menuBg.visible = true;
  app.stage.addChild(menuBg);

  // Menu Text //
  const menuText = new Text({
    text: "Click to start",
    style: {
      fontFamily: "Arial",
      fontSize: 42,
      fill: 0xffffff,
      align: "center",
    },
    anchor: { x: 0.5, y: 0.5 },
    position: { x: app.screen.width / 2, y: app.screen.height - 150 }, 
    interactive: true,
  });
  app.stage.addChild(menuText);

  // Scoreboard Text //
  const scoreboard = new Text({
    text: score.toString(),
    style: {
      fontFamily: "Arial",
      fontSize: 72,
      fill: 0x8a8a8a,
      align: "center",
    },
    anchor: { x: 0.5, y: 0.5 },
    position: { x: app.screen.width / 2, y: app.screen.height / 8 },
    interactive: true,
  });
  app.stage.addChild(scoreboard);

  // GAME FUNCTIONS //
  
  // Moves redPong to the mouse cursor Y level.
  function moveRedPong(e: any) {
    let pos = e.data.global;
    redPong.y = pos.y;
  };

  function checkRedPongBounds() {
    if (redPong.y - redPong.height / 2 <= 0 || redPong.y + redPong.height / 2 >= app.screen.height) {
      redPong.y = Math.max(redPong.height / 2, Math.min(redPong.y, app.screen.height - redPong.height / 2));
    }
  };

  function scoreIncrement() {
    score++;
    scoreboard.text = score.toString();
  };

  // MOVEMENT / COLLISION LOGIC //

  // funtion to move the ball
  function moveBall(delta: number) {
    // Initial movement animation listener
    
    ball.x += velocity.x * delta;
    ball.y += velocity.y * delta;

    // If ball collides with top window border reverse its velocity.y
    if (ball.y - ball.height / 2 <= 0 || ball.y + ball.height / 2 >= app.screen.height) {
      velocity.y *= -1;
    }
    // If ball collides with right window border reverse its velocity.x
    if(ball.x + ball.width / 2 >= app.screen.width) {
      velocity.x *= -1;
    }

    // If ball collides with Paddle
    if (AABBtest(redPong, ball)) {
      // Reverse velocity.x
      velocity.x *= -1;
      scoreIncrement();

      // 10% chance to ricochet, just to add some fun.
      const ricochetChance = Math.floor(Math.random() * 10) + 1;
      if (ricochetChance > 9) {
        velocity.y *= -1;
      }

      //  If ball hits the top or bottom third of the paddle have a 90% chance to ricochet.
      // Haven't quite figured out how to implement the full pong logic into Pixi yet.
      // Maybe using geometrical vectors to calculate the angle of the bounce, replacing sprites.
      if (ball.y - ball.width / 2 < redPong.y + redPong.height / 4 ||
          ball.y - ball.width / 2 > redPong.y + redPong.height * 3 / 4) {

        if (ricochetChance > 1) {
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
  }

  // GAME LOOP //
  // Click to start
  app.stage.on("click", startGame);

  function startGame() {
    menuBg.visible = false;
    menuText.visible = false;
    gameLoop();
  }
  
  function gameLoop() {
    app.ticker.add((time) => {

      const delta: number = time.deltaTime;
      checkRedPongBounds();
      moveBall(delta);
      
    });
  }

})();
