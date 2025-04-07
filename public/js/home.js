const slides = document.querySelectorAll(".img");
const loadScreen = document.querySelector(".loading");
const video = document.getElementById("loadingVideo");

let counter = 0;
slides.forEach((slide,index)=>{
  slide.style.left=`${index*100}%`
});

function changing() {
  slides.forEach((slide) => {
    slide.style.transform = `translateX(-${counter * 100}%)`;
  });
}

setInterval(() => {
  counter = counter + 1;
  if(counter > 2){
    counter = 0
  }
  changing();
}, 3000);

video.oncanplaythrough = function () {
  video.play();       
  loadScreen.style.opacity = "1";
  loadScreen.style.visibility = "visible";
};

window.addEventListener("load", function () {
  setTimeout(function () {
      loadScreen.style.opacity = "0";
      setTimeout(() => {
          loadScreen.style.display = "none";
      });
  }, 1500);
});

// eye button script
document.getElementById("togglePassword").addEventListener("click", function() {
  let passwordInput = document.getElementById("password");
  let icon = this.querySelector("i");

  if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
  } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
  }
});


function showLoading() {
  document.getElementById("loading-screen").style.display = "block";
}