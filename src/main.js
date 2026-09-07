import gsap from "gsap";

gsap.from("h1", {
  scale: 0,
  rotation: -120,
  duration: 1.4,
  ease: "bounce.out",
});

gsap.from(".block_list > div", {
  scaleY: 0.04,
  transformOrigin: "top center",
  duration: 1.2,
  stagger: 0.9,
  ease: "power3.out",
});

//gsap.from(".block_list > div", ...) targets all three colored blocks:
// scaleY: 0.04 makes each block start as a thin horizontal line
// transformOrigin: "top center" anchors the line at the top
// The blocks expand downward
// stagger: 0.9 starts each block after the previous one
// duration: 1.2 controls how long each expansion takes power3.out makes the animation slow down smoothly at the end //

gsap.to(".box", {
  keyframes: {
    y: [0, 80, -10, 30, 0],
    ease: "none", // <- ease across the entire set of keyframes (defaults to the one defined in the tween, or "none" if one isn't defined there)
    easeEach: "power2.inOut", // <- ease between each keyframe (defaults to "power1.inOut")
  },
  rotate: 180,
  ease: "elastic", // <- the "normal" part of the tween. In this case, it affects "rotate" because it's outside the keyframes
  duration: 5,
  stagger: 0.2,
});
// the timeline
function playAnimation(shape) {
  // the timeline
  let tl = gsap.timeline();
  tl.from(shape, {
    opacity: 0,
    scale: 0,
    ease: "elastic.out(1,0.3)",
  })
    .to(
      shape,
      {
        rotation: "random([-360, 360])",
      },
      "<",
    )
    .to(
      shape,
      {
        y: "120vh",
        ease: "back.in(.4)",
        duration: 1,
      },
      0,
    );
}
// interaction props
let gap = 100; // this number spaces the 'lil shapes out

/* --------------------------------

The other stuff...

------------------------------------*/
let flair = gsap.utils.toArray(".flair");
let index = 0;
let wrapper = gsap.utils.wrap(0, flair.length);
gsap.defaults({ duration: 1 });

let mousePos = { x: 0, y: 0 };
let lastMousePos = mousePos;
let cachedMousePos = mousePos;

window.addEventListener("mousemove", (e) => {
  mousePos = {
    x: e.x,
    y: e.y,
  };
});

gsap.ticker.add(ImageTrail);

function ImageTrail() {
  let travelDistance = Math.hypot(
    lastMousePos.x - mousePos.x,
    lastMousePos.y - mousePos.y,
  );

  // keep the previous mouse position for animation
  cachedMousePos.x = gsap.utils.interpolate(
    cachedMousePos.x || mousePos.x,
    mousePos.x,
    0.1,
  );
  cachedMousePos.y = gsap.utils.interpolate(
    cachedMousePos.y || mousePos.y,
    mousePos.y,
    0.1,
  );

  if (travelDistance > gap) {
    animateImage();
    lastMousePos = mousePos;
  }
}

function animateImage() {
  let wrappedIndex = wrapper(index);

  console.log(index, flair.length);

  let img = flair[wrappedIndex];
  gsap.killTweensOf(img);

  gsap.set(img, {
    clearProps: "all",
  });

  gsap.set(img, {
    opacity: 1,
    left: mousePos.x,
    top: mousePos.y,
    xPercent: -50,
    yPercent: -50,
  });

  playAnimation(img);

  index++;
}
console.clear();

let overlay = document.querySelector(".shape-overlays");
let paths = document.querySelectorAll(".shape-overlays__path");

let numPoints = 10;
let numPaths = paths.length;
let delayPointsMax = 0.3;
let delayPerPath = 0.25;
let duration = 0.9;
let isOpened = false;
let pointsDelay = [];
let allPoints = [];

let tl = gsap.timeline({
  onUpdate: render,
  defaults: {
    ease: "power2.inOut",
    duration: 0.9,
  },
});

for (let i = 0; i < numPaths; i++) {
  let points = [];
  allPoints.push(points);
  for (let j = 0; j < numPoints; j++) {
    points.push(100);
  }
}

overlay.addEventListener("click", onClick);
toggle();

function onClick() {
  if (!tl.isActive()) {
    isOpened = !isOpened;
    toggle();
  }
}

function toggle() {
  tl.progress(0).clear();

  for (let i = 0; i < numPoints; i++) {
    pointsDelay[i] = Math.random() * delayPointsMax;
  }

  for (let i = 0; i < numPaths; i++) {
    let points = allPoints[i];
    let pathDelay = delayPerPath * (isOpened ? i : numPaths - i - 1);

    for (let j = 0; j < numPoints; j++) {
      let delay = pointsDelay[j];
      tl.to(
        points,
        {
          [j]: 0,
        },
        delay + pathDelay,
      );
    }
  }
}

function render() {
  for (let i = 0; i < numPaths; i++) {
    let path = paths[i];
    let points = allPoints[i];

    let d = "";
    d += isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;

    for (let j = 0; j < numPoints - 1; j++) {
      let p = ((j + 1) / (numPoints - 1)) * 100;
      let cp = p - ((1 / (numPoints - 1)) * 100) / 2;
      d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
    }

    d += isOpened ? ` V 100 H 0` : ` V 0 H 0`;
    path.setAttribute("d", d);
  }
}
