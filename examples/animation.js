// Start kaboom
kaplay();

loadSprite("bean", "sprites/bean.png");

const rotatingBean = add([
    sprite("bean"),
    pos(50, 50),
    anchor("center"),
    rotate(0),
    animate(),
]);

rotatingBean.animate("angle", [0, 360], null, {
    duration: 2,
    endBehavior: "loop",
});

const movingBean = add([
    sprite("bean"),
    pos(50, 150),
    anchor("center"),
    animate(),
]);

movingBean.animate("pos", [vec2(50, 150), vec2(150, 150)], null, {
    duration: 2,
    endBehavior: "ping-pong",
});

const coloringBean = add([
    sprite("bean"),
    pos(50, 300),
    anchor("center"),
    color(WHITE),
    animate(),
]);

coloringBean.animate("color", [WHITE, RED, GREEN, BLUE, WHITE], null, {
    duration: 8,
    endBehavior: "loop",
});

const squaringBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate(),
]);

squaringBean.animate(
    "pos",
    [
        vec2(50, 400),
        vec2(150, 400),
        vec2(150, 500),
        vec2(50, 500),
        vec2(50, 400),
    ],
    null,
    { duration: 8, endBehavior: "loop" },
);

const timedSquaringBean = add([
    sprite("bean"),
    pos(50, 400),
    anchor("center"),
    animate(),
]);

timedSquaringBean.animate(
    "pos",
    [
        vec2(50, 400),
        vec2(150, 400),
        vec2(150, 500),
        vec2(50, 500),
        vec2(50, 400),
    ],
    [
        0,
        0.1,
        0.3,
        0.7,
        1.0,
    ],
    { duration: 8, endBehavior: "loop" },
);