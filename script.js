const GAME_WIDTH = 224;
const GAME_HEIGHT = 288;
const ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT;


async function initGame() {
    const app = new PIXI.Application();
    
    await app.init({
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: 0x1099bb,
    });
    
    document.body.appendChild(app.canvas);
    function resizeCanvas() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowRatio = windowWidth / windowHeight;
        
        let newWidth, newHeight;
        
        if (windowRatio > ASPECT_RATIO) {
            newHeight = windowHeight;
            newWidth = newHeight * ASPECT_RATIO;
        } else {
            newWidth = windowWidth;
            newHeight = newWidth / ASPECT_RATIO;
        }
        
        app.canvas.style.width = newWidth + 'px';
        app.canvas.style.height = newHeight + 'px';
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Game settings
    const shipSpeed = 3;
    const enemySpeed = 2;
    const enemySpawnRate = 0.02; // Chance to spawn enemy each frame (2%)

    // Set our base path for loading assets
    await PIXI.Assets.init({
        basePath: 'https://raw.githubusercontent.com/IanMatthewHuff/PixiJSAssets/refs/heads/main'
        //basePath: 'https://soothing-beguiling-movie-517.vscodeedu.app'
    });

    // Load our ship sprite
    const texture = await PIXI.Assets.load("player-ship.png");
    const ship = new PIXI.Sprite(texture);
    const enemyTexture = await PIXI.Assets.load("enemy-ship.png");

    // Array to store enemy ships
    const enemies = [];

    // Add to stage
    app.stage.addChild(ship);

    // Center the sprite's anchor point
    ship.anchor.set(0.5);

    // Move the sprite to the center of the screen
    ship.x = app.screen.width / 2;
    ship.y = app.screen.height / 2;

    // Function to spawn enemy ships
    function spawnEnemy() {
        const enemy = new PIXI.Sprite(enemyTexture);
        enemy.anchor.set(0.5);
        
        // Random position across the top of the screen (integer values to avoid blurry sprites)
        enemy.x = Math.floor(Math.random() * GAME_WIDTH);
        enemy.y = -16; // Start just above the screen (half sprite height)
        
        app.stage.addChild(enemy);
        enemies.push(enemy);
    }

    // Handle keyboard input
    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Hook up our update function
    function update() {
        // Randomly spawn enemy ships
        if (Math.random() < enemySpawnRate && enemies.length < 10) {
            spawnEnemy();
        }

        // Move enemy ships downward
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.y += enemySpeed;
            
            // Remove enemies that have moved off the bottom of the screen
            if (enemy.y > GAME_HEIGHT + 16) {
                app.stage.removeChild(enemy);
                enemies.splice(i, 1);
            }
        }

        // Check for arrow key presses and move the ship
        if (keys['ArrowLeft']) {
            ship.x -= shipSpeed;
        }
        if (keys['ArrowRight']) {
            ship.x += shipSpeed;
        }
        if (keys['ArrowUp']) {
            ship.y -= shipSpeed;
        }
        if (keys['ArrowDown']) {
            ship.y += shipSpeed;
        }

        // Keep the ship within the game bounds (accounting for 32x32 sprite size)
        const halfShipWidth = 16;  // Half of 32 pixels
        const halfShipHeight = 16; // Half of 32 pixels
        
        // Left boundary
        if (ship.x < halfShipWidth) {
            ship.x = halfShipWidth;
        }
        // Right boundary
        if (ship.x > GAME_WIDTH - halfShipWidth) {
            ship.x = GAME_WIDTH - halfShipWidth;
        }
        // Top boundary
        if (ship.y < halfShipHeight) {
            ship.y = halfShipHeight;
        }
        // Bottom boundary
        if (ship.y > GAME_HEIGHT - halfShipHeight) {
            ship.y = GAME_HEIGHT - halfShipHeight;
        }
    }
    app.ticker.add(update);
}

// Wait for DOM to be ready, then initialize the game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}