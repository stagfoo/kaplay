// TODO: document

kaboom({
	debug: true,
});

const objs = [
	"apple",
	"lightening",
	"robot",
	"coin",
	"car",
	"key",
	"door",
	"bomb",
];

for (const obj of objs) {
	loadSprite(obj, `sprites/${obj}.png`);
}

loadBean();
loadSound("hit", "sounds/hit.mp3");
loadSound("shoot", "sounds/shoot.mp3");
loadSound("explosion", "sounds/explosion.mp3");
loadSound("OtherworldlyFoe", "sounds/OtherworldlyFoe.mp3");

scene("battle", () => {

	const BULLET_SPEED = 1200;
	const TRASH_SPEED = 120;
	const BOSS_SPEED = 48;
	const PLAYER_SPEED = 480;
	const STAR_SPEED = 120;
	const BOSS_HEALTH = 1000;
	const OBJ_HEALTH = 4;

	const bossName = choose(objs);

	let insaneMode = false;

	const music = play("OtherworldlyFoe");

	layers([
		"game",
		"ui",
	], "game");

	volume(0.5);

	function grow(rate) {
		return {
			update() {
				const n = rate * dt();
				this.scale.x += n;
				this.scale.y += n;
			},
		};
	}

	function late(t) {
		let timer = 0;
		return {
			add() {
				this.hidden = true;
			},
			update() {
				timer += dt();
				if (timer >= t) {
					this.hidden = false;
				}
			},
		};
	}

	add([
		text("KILL", { size: 160 }),
		pos(width() / 2, height() / 2),
		origin("center"),
		lifespan(1),
		fixed(),
		layer("ui"),
	]);

	add([
		text("THE", { size: 80 }),
		pos(width() / 2, height() / 2),
		origin("center"),
		lifespan(2),
		late(1),
		fixed(),
		layer("ui"),
	]);

	add([
		text(bossName.toUpperCase(), { size: 120 }),
		pos(width() / 2, height() / 2),
		origin("center"),
		lifespan(4),
		late(2),
		fixed(),
		layer("ui"),
	]);

	const sky = add([
		rect(width(), height()),
		color(0, 0, 0, 0),
	]);

	sky.action(() => {
		if (insaneMode) {
			const t = time() * 10;
			sky.color.a = 1;
			sky.color.r = wave(127, 255, t);
			sky.color.g = wave(127, 255, t + 1);
			sky.color.b = wave(127, 255, t + 2);
		} else {
			sky.color = rgba(0, 0, 255, 0);
		}
	});

// 	add([
// 		sprite("stars"),
// 		scale(width() / 240, height() / 240),
// 		pos(0, 0),
// 		"stars",
// 	]);

// 	add([
// 		sprite("stars"),
// 		scale(width() / 240, height() / 240),
// 		pos(0, -height()),
// 		"stars",
// 	]);

// 	action("stars", (r) => {
// 		r.move(0, STAR_SPEED * (insaneMode ? 10 : 1));
// 		if (r.pos.y >= height()) {
// 			r.pos.y -= height() * 2;
// 		}
// 	});

	const player = add([
		sprite("bean"),
		area(),
		pos(width() / 2, height() - 64),
		origin("center"),
	]);

	keyDown("left", () => {
		player.move(-PLAYER_SPEED, 0);
		if (player.pos.x < 0) {
			player.pos.x = width();
		}
	});

	keyDown("right", () => {
		player.move(PLAYER_SPEED, 0);
		if (player.pos.x > width()) {
			player.pos.x = 0;
		}
	});

	keyPress("up", () => {
		insaneMode = true;
		music.speed(2);
	});

	keyRelease("up", () => {
		insaneMode = false;
		music.speed(1);
	});

	player.collides("enemy", (e) => {
		destroy(e);
		destroy(player);
		shake(120);
		play("explosion");
		music.detune(-1200);
		addExplode(center(), 12, 120, 30);
		wait(1, () => {
			music.stop();
			go("battle");
		});
	});

	function addExplode(p, n, rad, size) {
		for (let i = 0; i < n; i++) {
			wait(rand(n * 0.1), () => {
				for (let i = 0; i < 2; i++) {
					add([
						pos(p.add(rand(vec2(-rad), vec2(rad)))),
						rect(4, 4),
						outline(4),
						scale(1 * size, 1 * size),
						lifespan(0.1),
						grow(rand(48, 72) * size),
						origin("center"),
					]);
				}
			});
		}
	}

	function spawnBullet(p) {
		add([
			rect(12, 48),
			area(),
			pos(p),
			origin("center"),
			color(127, 127, 255),
			outline(4),
			// strings here means a tag
			"bullet",
		]);
	}

	action("bullet", (b) => {
		if (insaneMode) {
			b.color = rand(rgb(0, 0, 0), rgb(255, 255, 255));
		}
	});

	keyPress("space", () => {
		spawnBullet(player.pos.sub(16, 0));
		spawnBullet(player.pos.add(16, 0));
		play("shoot", {
			volume: 0.3,
			detune: rand(-1200, 1200),
		});
	});

	// run this callback every frame for all objects with tag "bullet"
	action("bullet", (b) => {
		b.move(0, -BULLET_SPEED);
		// remove the bullet if it's out of the scene for performance
		if (b.pos.y < 0) {
			destroy(b);
		}
	});

	function spawnTrash() {
		const name = choose(objs.filter(n => n != bossName));
		add([
			sprite(name),
			area(),
			pos(rand(0, width()), 0),
			health(OBJ_HEALTH),
			origin("bot"),
			"trash",
			"enemy",
			{
				speed: rand(TRASH_SPEED * 0.5, TRASH_SPEED * 1.5),
			},
		]);
		wait(insaneMode ? 0.1 : 0.3, spawnTrash);
	}

	const boss = add([
		sprite(bossName),
		area(),
		pos(width() / 2, 40),
		health(BOSS_HEALTH),
		scale(3),
		origin("top"),
		"enemy",
		{
			dir: 1,
		},
	]);

	on("death", "enemy", (e) => {
		destroy(e);
		shake(2);
		addKaboom(e.pos);
	});

	on("hurt", "enemy", (e) => {
		shake(1);
		play("hit", {
			detune: rand(-1200, 1200),
			speed: rand(0.2, 2),
		});
	});

	const timer = add([
		text(0),
		pos(12, 32),
		fixed(),
		layer("ui"),
		{ time: 0, },
	]);

	timer.action(() => {
		timer.time += dt();
		timer.text = timer.time.toFixed(2);
	});

	collides("bullet", "enemy", (b, e) => {
		destroy(b);
		e.hurt(insaneMode ? 10 : 1);
		addExplode(b.pos, 1, 24, 1);
	});

	action("trash", (t) => {
		t.move(0, t.speed * (insaneMode ? 5 : 1));
		if (t.pos.y - t.height > height()) {
			destroy(t);
		}
	});

	boss.action((p) => {
		boss.move(BOSS_SPEED * boss.dir * (insaneMode ? 3 : 1), 0);
		if (boss.dir === 1 && boss.pos.x >= width() - 20) {
			boss.dir = -1;
		}
		if (boss.dir === -1 && boss.pos.x <= 20) {
			boss.dir = 1;
		}
	});

	boss.on("hurt", () => {
		healthbar.set(boss.hp());
	});

	boss.on("death", () => {
		music.stop();
		go("win", {
			time: timer.time,
			boss: bossName,
		});
	});

	const healthbar = add([
		rect(width(), 24),
		pos(0, 0),
		color(127, 255, 127),
		fixed(),
		layer("ui"),
		{
			max: BOSS_HEALTH,
			set(hp) {
				this.width = width() * hp / this.max;
				this.flash = true;
			},
		},
	]);

	healthbar.action(() => {
		if (healthbar.flash) {
			healthbar.color = rgb(255, 255, 255);
			healthbar.flash = false;
		} else {
			healthbar.color = rgb(127, 255, 127);
		}
	});

	spawnTrash();

});

scene("win", ({ time, boss }) => {

	const b = burp({
		loop: true,
	});

	loop(0.5, () => {
		b.detune(rand(-1200, 1200));
	});

	add([
		sprite(boss),
		color(255, 127, 127),
		origin("center"),
		scale(8),
		pos(width() / 2, height() / 2),
	]);

	add([
		text(time.toFixed(2), 24),
		origin("center"),
		pos(width() / 2, height() / 2),
	]);

});

go("battle");