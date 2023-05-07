const app = new PIXI.Application({ 
    width: 800, 
    height: 400,
    resolution: 2,
    backgroundColor: 0xffffff,
    autoDensity: true,
    antialias: true
});
document.getElementById("easingCanvas").appendChild(app.view);

const OutElastic = (power, elasticity) => (t) => {
    const scaleFactor = 0.175 * elasticity + 0.0875;
    const phaseShift  = power / 4;
    const maxValue    = Math.sin((scaleFactor - phaseShift) * (2 * Math.PI) / power) * Math.pow(2, -10 * scaleFactor) + 1;
    t *= scaleFactor;
    const sb     = Math.sin((t - phaseShift) * (2 * Math.PI) / power);
    const value  = sb * Math.pow(2, -10 * t) + 1;
    return value / maxValue;
}

const grid = new PIXI.Graphics();
const ticGfx = new PIXI.Graphics();
const tics = new PIXI.Container();
app.stage.addChild(grid);
tics.addChild(ticGfx);
app.stage.addChild(tics);

function makeGrid() {
    const width = app.view.clientWidth;
    const height = app.view.clientHeight;

    // Line thickness is 2 pixels
    grid.lineStyle(1, 0xdddddd);
    for (let i = 0; i <= width; i += 10) {
        grid.moveTo(i, 0);
        grid.lineTo(i, height);
        grid.moveTo(0, i);
        grid.lineTo(width, i);
    }

    grid.lineStyle(1, 0xbbbbbb);
    grid.moveTo(0, height / 2);
    grid.lineTo(width, height / 2);

    grid.lineStyle(1, 0x000000);
    grid.moveTo(width / 4, 0);
    grid.lineTo(width / 4, height);
    grid.moveTo(width * 3 / 4, 0);
    grid.lineTo(width * 3 / 4, height);

    // shift the grid to the right by 0.5 pixels and down by 0.5 pixels
    grid.position.set(0.5, 0.5);
    grid.cacheAsBitmap = true;

    // Draw text at the bottom of the grid
    const style = new PIXI.TextStyle({
        fontFamily: 'Segoe UI',
        fontSize: 10,
        fontWeight: 'bold',
        fill: '#555555',
    });

    // loop 0 to 1 in 0.1 increments
    for (let i = .1; i <= 1; i += 0.1) {
        const text = new PIXI.Text(i.toFixed(1), style);
        text.x = i * width - text.width / 2;
        text.y = height - 18;
        tics.addChild(text);

        // tic marks
        ticGfx.lineStyle(1, 0x555555);
        ticGfx.moveTo(i * width, height - 5);
        ticGfx.lineTo(i * width, height);
    }
    // do the same for the y axis
    for (let i = .1; i <= 1; i += 0.1) {
        const text = new PIXI.Text((i*2).toFixed(1), style);
        text.x = 8;
        text.y = (1 - i) * height - text.height / 2;
        tics.addChild(text);

        ticGfx.lineStyle(1, 0x555555);
        ticGfx.moveTo(0, i * height);
        ticGfx.lineTo(5, i * height);
    }
    ticGfx.position.set(.5, .5);
    tics.cacheAsBitmap = true;
}

const easingCurve = new PIXI.Graphics();
app.stage.addChild(easingCurve);
function plotEasingFunction() {
    easingCurve.cacheAsBitmap = false;
    const width = app.view.clientWidth;
    const height = app.view.clientHeight;

    easingCurve.clear();
    easingCurve.lineStyle(1.5, 0xff0000, 0.5);
    easingCurve.moveTo(0, height - OutElastic(window._power, window._bounciness)(0) * (height / 2));
    for (let x = 1; x <= width; x++) {
        const input = x / width;
        const output = OutElastic(window._power, window._bounciness)(input);
        easingCurve.lineTo(x, height - output * (height / 2));
    }
    easingCurve.cacheAsBitmap = true;
}

const rectangle = new PIXI.Graphics();
app.stage.addChild(rectangle);
const rectangleWidth = 20;
const rectangleHeight = 9;
function drawRoundedRectangle(width, height, color) {
    rectangle.clear();
    rectangle.beginFill(color);
    rectangle.drawRoundedRect(0, 0, width, height, 2);
    rectangle.endFill();
    rectangle.cacheAsBitmap = true;
}

// Create the time dot
const dot = new PIXI.Graphics();
dot.visible = false;
app.stage.addChild(dot);

function drawDot() {
    dot.clear();
    dot.beginFill(0xff0000, 0.5);
    // set alpha 50%
    dot.drawCircle(0, 0, 4); // 4 is the radius of the dot
    dot.endFill();
    dot.cacheAsBitmap = true;
}

// create noUiSlider
let pslider = document.getElementById('powerslider');
pslider = noUiSlider.create(pslider, {
    start: [0.3],
    range: {
        'min': 0,
        'max': 2.0
    },
    pips: {
        mode: 'steps',
        stepped: true,
    },
    pips: {
        mode: 'values',
        values: [0, 2.0],
        stepped: true,
        density: 1.1/.05,
    },
    tooltips: true
});
pslider.on('update', (values, handle) => {
    window._power = values[handle];
    plotEasingFunction();
});

let bslider = document.getElementById('bouncinessslider');
bslider = noUiSlider.create(bslider, {
    start: [3],
    step: .1,
    range: {
        'min': 0,
        'max': 20
    },
    pips: {
        mode: 'values',
        values: [0, 5, 10, 15, 20],
        stepped: true,
        density: 5
    },
    tooltips: true
});
bslider.on('update', (values, handle) => {
    window._bounciness = values[handle];
    
    plotEasingFunction();
});

// duration slider, look for id tweenlength
let dslider = document.getElementById('tweenlength');
dslider = noUiSlider.create(dslider, {
    start: [1000],
    step: 50,
    range: {
        'min': 200,
        'max': 2000
    },
    pips: {
        mode: 'values',
        values: [ 200, 500, 1000, 1500, 2000],
        stepped: true,
        density: 5
    },
    format: {to: x => x.toFixed(0), from: x => x},
    tooltips: true
});
dslider.on('update', (values, handle) => {
    window.animationDuration = values[handle];
});

// create noUiSlider toggle for dot visibility on the toggleVisualizeTime
let toggleVisualizeTime = document.getElementById('toggleVisualizeTime');
toggleVisualizeTime.addEventListener('pointerdown', (e) => {
    let newValue = toggleVisualizeTime.get();
    newValue^=1;
    toggleVisualizeTime.set(newValue);
    dot.visible = !!newValue;
});
toggleVisualizeTime = noUiSlider.create(toggleVisualizeTime, {
    start: 0,
    connect: [true, false],
    step: 1,
    range: {
        'min': 0,
        'max': 1 
    },
});


let animationStartTime = null;
window.animationDuration = 1000; // Animation duration in milliseconds
function animate(delta) {
    if (!animationStartTime) {
        animationStartTime = app.ticker.lastTime;
    }

    const elapsedTime = app.ticker.lastTime - animationStartTime;
    const progress = Math.min(elapsedTime / window.animationDuration, 1);
    const easedProgress = OutElastic(window._power, window._bounciness)(progress);

    if (progress >= 1) {
        animationStartTime = null;
        app.ticker.addOnce(() => setTimeout(() => app.ticker.start(), 150));
        app.ticker.stop();
    }

    const x = app.view.clientWidth / 4 + (app.view.clientWidth / 2 - rectangleWidth) * easedProgress;
    const y = app.view.clientHeight / 2 - rectangleHeight / 2;

    // Move the rectangle graphics object position
    rectangle.position.set(x, y);

    const dotX = progress * app.view.clientWidth;
    const dotY = app.view.clientHeight - easedProgress * (app.view.clientHeight / 2);
    dot.position.set(dotX, dotY);
}
makeGrid();
drawRoundedRectangle(rectangleWidth, rectangleHeight, 0x2fcc44);
drawDot();
app.ticker.add(animate);
